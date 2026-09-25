import * as vscode from 'vscode';
import { InitializrMetadata, MetadataCache } from './types';
import { ParseError } from '../utils/errors';
import { Logger } from '../utils/logger';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY = 'initializr.metadata.cache';

export async function fetchMetadata(context: vscode.ExtensionContext): Promise<InitializrMetadata> {
    // Try cache first
    const cached = loadFromCache(context);
    if (cached) {
        Logger.info('Using cached metadata');
        // Background refresh for next time
        refreshInBackground(context);
        return cached;
    }

    Logger.info('Fetching fresh metadata from Spring Initializr');
    return fetchFreshMetadata(context);
}

function loadFromCache(context: vscode.ExtensionContext): InitializrMetadata | null {
    try {
        const cached = context.globalState.get<MetadataCache>(CACHE_KEY);
        if (!cached) {
            return null;
        }

        const age = Date.now() - cached.timestamp;
        if (age > CACHE_TTL_MS) {
            Logger.info('Cached metadata expired');
            return null;
        }

        return cached.data;
    } catch (err) {
        Logger.warn('Failed to load cached metadata', err);
        return null;
    }
}

async function fetchFreshMetadata(context: vscode.ExtensionContext): Promise<InitializrMetadata> {
    const { InitializrClient } = await import('./InitializrClient');
    const client = new InitializrClient();
    
    const raw = await client.getMetadata();
    const parsed = parseMetadata(raw);
    
    // Cache the result
    const cache: MetadataCache = {
        timestamp: Date.now(),
        data: parsed,
        sourceUrl: client.baseUrl
    };
    
    await context.globalState.update(CACHE_KEY, cache);
    Logger.info('Metadata cached successfully');
    
    return parsed;
}

function refreshInBackground(context: vscode.ExtensionContext): void {
    // Fire and forget
    fetchFreshMetadata(context).catch(err => 
        Logger.warn('Background metadata refresh failed', err)
    );
}

function parseMetadata(raw: any): InitializrMetadata {
    try {
        // Transform Spring Initializr raw format to our typed format
        const bootVersions = parseSelectOptions(raw.bootVersion?.values || []);
        const javaVersions = parseSelectOptions(raw.javaVersion?.values || []);
        const languages = parseSelectOptions(raw.language?.values || []);
        const projectTypes = parseSelectOptions(raw.type?.values || []);
        const packagingTypes = parseSelectOptions(raw.packaging?.values || []);
        const dependencyGroups = parseDependencyGroups(raw.dependencies?.values || []);

        const defaults = {
            bootVersion: raw.bootVersion?.default || bootVersions[0]?.id || '3.3.4',
            language: raw.language?.default || 'java',
            projectType: raw.type?.default || 'maven-project',
            packaging: raw.packaging?.default || 'jar',
            javaVersion: raw.javaVersion?.default || javaVersions[0]?.id || '21',
            groupId: 'com.example',
            artifactId: 'demo'
        };

        return {
            bootVersions,
            javaVersions,
            languages,
            projectTypes,
            packagingTypes,
            dependencyGroups,
            defaults
        };
    } catch (err) {
        throw new ParseError('Failed to parse Spring Initializr metadata', err);
    }
}

function parseSelectOptions(values: any[]): import('./types').SelectOption[] {
    return values.map(v => ({
        id: v.id || '',
        name: v.name || v.id || '',
        default: v.default === true
    }));
}

function parseDependencyGroups(values: any[]): import('./types').DependencyGroup[] {
    return values.map(group => ({
        name: group.name || '',
        dependencies: (group.values || []).map((dep: any) => ({
            id: dep.id || '',
            name: dep.name || dep.id || '',
            description: dep.description || '',
            versionRange: dep.versionRange
        }))
    }));
}