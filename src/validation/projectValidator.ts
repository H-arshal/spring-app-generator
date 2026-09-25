import { ProjectConfiguration, InitializrMetadata } from '../initializr/types';
import { ValidationError } from '../utils/errors';

export interface ValidationResult {
    valid: boolean;
    errors: FieldError[];
}

export interface FieldError {
    field: string;
    message: string;
}

const GROUP_ID_REGEX = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/;
const ARTIFACT_ID_REGEX = /^[a-z][a-z0-9-]*$/;
const PACKAGE_NAME_REGEX = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/;

export function validateProjectConfig(
    config: ProjectConfiguration,
    metadata: InitializrMetadata | null
): ValidationResult {
    const errors: FieldError[] = [];

    // groupId
    if (!config.groupId?.trim()) {
        errors.push({ field: 'groupId', message: 'Group ID is required' });
    } else if (!GROUP_ID_REGEX.test(config.groupId)) {
        errors.push({ field: 'groupId', message: 'Group ID must be a valid Java package (e.g. com.example)' });
    }

    // artifactId
    if (!config.artifactId?.trim()) {
        errors.push({ field: 'artifactId', message: 'Artifact ID is required' });
    } else if (!ARTIFACT_ID_REGEX.test(config.artifactId)) {
        errors.push({ field: 'artifactId', message: 'Artifact ID must be lowercase letters, digits, or hyphens' });
    }

    // name
    if (!config.name?.trim()) {
        errors.push({ field: 'name', message: 'Project name is required' });
    } else if (config.name.trim().length > 100) {
        errors.push({ field: 'name', message: 'Project name must be 100 characters or fewer' });
    }

    // packageName
    if (!config.packageName?.trim()) {
        errors.push({ field: 'packageName', message: 'Package name is required' });
    } else if (!PACKAGE_NAME_REGEX.test(config.packageName)) {
        errors.push({ field: 'packageName', message: 'Package name must be a valid Java package (e.g. com.example.demo)' });
    }

    // description (optional, max 255)
    if (config.description && config.description.length > 255) {
        errors.push({ field: 'description', message: 'Description must be 255 characters or fewer' });
    }

    // bootVersion — must exist in metadata if available
    if (!config.bootVersion?.trim()) {
        errors.push({ field: 'bootVersion', message: 'Spring Boot version is required' });
    } else if (metadata) {
        const valid = metadata.bootVersions.some(v => v.id === config.bootVersion);
        if (!valid) {
            errors.push({ field: 'bootVersion', message: 'Selected Spring Boot version is not available' });
        }
    }

    // javaVersion — must exist in metadata if available
    if (!config.javaVersion?.trim()) {
        errors.push({ field: 'javaVersion', message: 'Java version is required' });
    } else if (metadata) {
        const valid = metadata.javaVersions.some(v => v.id === config.javaVersion);
        if (!valid) {
            errors.push({ field: 'javaVersion', message: 'Selected Java version is not available' });
        }
    }

    // targetPath-level validation is handled in ProjectService
    return { valid: errors.length === 0, errors };
}

export function throwIfInvalid(config: ProjectConfiguration, metadata: InitializrMetadata | null): void {
    const result = validateProjectConfig(config, metadata);
    if (!result.valid) {
        const first = result.errors[0];
        throw new ValidationError(first.message, first.field);
    }
}

/**
 * Derives a safe Java package name from groupId + artifactId.
 * e.g. "com.example" + "ecommerce-api" → "com.example.ecommerceapi"
 */
export function derivePackageName(groupId: string, artifactId: string): string {
    const safeArtifact = artifactId
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');   // strip hyphens, underscores, etc.
    return `${groupId}.${safeArtifact}`;
}
