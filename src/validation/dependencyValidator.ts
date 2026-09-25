import { InitializrMetadata } from '../initializr/types';
import { Logger } from '../utils/logger';

/**
 * Validates that all selected dependency IDs exist in the current metadata.
 * Unknown IDs are logged as warnings — they do not block generation.
 * (Spring Initializr will reject them server-side if truly invalid.)
 */
export function validateDependencies(
    dependencies: string[],
    metadata: InitializrMetadata
): { valid: string[]; unknown: string[] } {
    const allIds = new Set(
        metadata.dependencyGroups.flatMap(g => g.dependencies.map(d => d.id))
    );

    const valid: string[] = [];
    const unknown: string[] = [];

    for (const dep of dependencies) {
        if (allIds.has(dep)) {
            valid.push(dep);
        } else {
            unknown.push(dep);
            Logger.warn(`Unknown dependency ID: "${dep}" — not found in current metadata`);
        }
    }

    return { valid, unknown };
}
