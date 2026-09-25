import * as https from 'https';
import * as vscode from 'vscode';
import { ProjectConfiguration } from './types';
import { NetworkError, InitializrError } from '../utils/errors';
import { Logger } from '../utils/logger';

export class InitializrClient {
    private readonly _baseUrl: string;

    constructor() {
        const config = vscode.workspace.getConfiguration('springBootInitializer');
        this._baseUrl = config.get<string>('initializrUrl', 'https://start.spring.io');
        Logger.info(`InitializrClient configured for: ${this._baseUrl}`);
    }

    get baseUrl(): string {
        return this._baseUrl;
    }

    /**
     * Fetch metadata from Spring Initializr.
     */
    async getMetadata(): Promise<any> {
        const url = `${this._baseUrl}/`;
        
        Logger.info(`Fetching metadata from ${url}`);
        
        return new Promise((resolve, reject) => {
            const options = {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'VS Code Spring Boot Initializer Extension'
                }
            };

            const req = https.get(url, options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const parsed = JSON.parse(data);
                            Logger.info('Metadata fetched successfully');
                            resolve(parsed);
                        } catch (err) {
                            reject(new InitializrError('Invalid JSON response from Spring Initializr', res.statusCode));
                        }
                    } else {
                        reject(new InitializrError(
                            `Spring Initializr returned ${res.statusCode}`,
                            res.statusCode,
                            data
                        ));
                    }
                });
            });

            req.on('error', (err) => {
                Logger.error('Network error while fetching metadata', err);
                reject(new NetworkError('Failed to connect to Spring Initializr', err));
            });

            req.setTimeout(10000, () => {
                req.destroy();
                reject(new NetworkError('Request to Spring Initializr timed out'));
            });
        });
    }

    /**
     * Generate a Spring Boot project.
     */
    async generateProject(config: ProjectConfiguration): Promise<Uint8Array> {
        const url = `${this._baseUrl}/starter.zip`;
        const postData = this._buildFormData(config);
        
        Logger.info(`Generating project: ${config.artifactId}`);
        
        return new Promise((resolve, reject) => {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData),
                    'User-Agent': 'VS Code Spring Boot Initializer Extension'
                }
            };

            const req = https.request(url, options, (res) => {
                const chunks: Buffer[] = [];

                res.on('data', (chunk: Buffer) => {
                    chunks.push(chunk);
                });

                res.on('end', () => {
                    if (res.statusCode === 200) {
                        const zipBuffer = Buffer.concat(chunks);
                        Logger.info(`Project ZIP received: ${zipBuffer.length} bytes`);
                        resolve(new Uint8Array(zipBuffer));
                    } else {
                        const errorText = Buffer.concat(chunks).toString('utf8');
                        let serverMessage = errorText;
                        try {
                            const parsed = JSON.parse(errorText);
                            serverMessage = parsed.message || errorText;
                        } catch {
                            // Not JSON, use raw text
                        }
                        
                        reject(new InitializrError(
                            `Spring Initializr generation failed (${res.statusCode})`,
                            res.statusCode,
                            serverMessage
                        ));
                    }
                });
            });

            req.on('error', (err) => {
                Logger.error('Network error during project generation', err);
                reject(new NetworkError('Failed to generate project', err));
            });

            req.setTimeout(30000, () => {
                req.destroy();
                reject(new NetworkError('Project generation timed out'));
            });

            req.write(postData);
            req.end();
        });
    }

    private _buildFormData(config: ProjectConfiguration): string {
        const params = new URLSearchParams();
        
        params.set('type', config.projectType);
        params.set('language', config.language);
        params.set('bootVersion', config.bootVersion);
        params.set('groupId', config.groupId);
        params.set('artifactId', config.artifactId);
        params.set('name', config.name);
        params.set('description', config.description);
        params.set('packageName', config.packageName);
        params.set('packaging', config.packaging);
        params.set('javaVersion', config.javaVersion);
        
        if (config.dependencies.length > 0) {
            params.set('dependencies', config.dependencies.join(','));
        }
        
        return params.toString();
    }
}