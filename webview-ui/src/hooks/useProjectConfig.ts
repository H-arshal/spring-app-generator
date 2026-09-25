import { useState, useCallback } from 'react';
import type { ProjectConfiguration, InitializrMetadata } from '../services/messageService';

export interface ProjectConfigState extends ProjectConfiguration {
  // UI-only flag: true once the user has manually edited packageName
  packageNameEditing: boolean;
}

export interface ProjectConfigHookResult {
  config: ProjectConfigState;
  updateField: <K extends keyof ProjectConfigState>(
    field: K,
    value: ProjectConfigState[K]
  ) => void;
  setGroupId: (value: string) => void;
  setArtifactId: (value: string) => void;
  setPackageName: (value: string) => void;
  resetPackageName: () => void;
  setDependencies: (deps: string[]) => void;
  toggleDependency: (id: string) => void;
}

const FALLBACK: Omit<ProjectConfigState, 'packageNameEditing'> = {
  bootVersion: '',
  language: 'java',
  projectType: 'maven-project',
  packaging: 'jar',
  javaVersion: '',
  groupId: 'com.example',
  artifactId: 'demo',
  name: 'demo',
  description: '',
  packageName: 'com.example.demo',
  dependencies: [],
};

function seedFromMetadata(metadata: InitializrMetadata | null): ProjectConfigState {
  const d = metadata?.defaults;
  if (!d) {
    return { ...FALLBACK, packageNameEditing: false };
  }
  const groupId = d.groupId || FALLBACK.groupId;
  const artifactId = d.artifactId || FALLBACK.artifactId;
  return {
    bootVersion: d.bootVersion || '',
    language: d.language || 'java',
    projectType: d.projectType || 'maven-project',
    packaging: d.packaging || 'jar',
    javaVersion: d.javaVersion || '',
    groupId,
    artifactId,
    name: artifactId,
    description: '',
    packageName: `${groupId}.${derivePackageSuffix(artifactId)}`,
    dependencies: [],
    packageNameEditing: false,
  };
}

/**
 * Manages the full project configuration form.
 *
 * - packageName auto-derives from groupId + artifactId by default.
 * - Once the user manually edits packageName, auto-derivation is disabled
 *   until they click "reset".
 */
export function useProjectConfig(metadata: InitializrMetadata | null): ProjectConfigHookResult {
  const [config, setConfig] = useState<ProjectConfigState>(() =>
    seedFromMetadata(metadata)
  );

  // When metadata arrives (or refreshes), fill any still-empty fields from the
  // new defaults without clobbering values the user has already set. This uses
  // React's documented "adjust state when a prop changes" pattern (storing the
  // previous input) rather than an effect, which avoids cascading renders.
  const [appliedMetadata, setAppliedMetadata] = useState<InitializrMetadata | null>(null);
  if (metadata && metadata !== appliedMetadata) {
    setAppliedMetadata(metadata);
    setConfig(prev => mergeDefaults(prev, metadata));
  }

  const updateField = useCallback(
    <K extends keyof ProjectConfigState>(field: K, value: ProjectConfigState[K]) => {
      setConfig(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  /** Auto-derive packageName from groupId + artifactId (unless editing). */
  const updateGroupId = useCallback((value: string) => {
    setConfig(prev => {
      if (prev.packageNameEditing) {
        return { ...prev, groupId: value };
      }
      return {
        ...prev,
        groupId: value,
        packageName: `${value}.${derivePackageSuffix(prev.artifactId)}`,
      };
    });
  }, []);

  const updateArtifactId = useCallback((value: string) => {
    setConfig(prev => {
      if (prev.packageNameEditing) {
        return { ...prev, artifactId: value, name: value };
      }
      return {
        ...prev,
        artifactId: value,
        name: value,
        packageName: `${prev.groupId}.${derivePackageSuffix(value)}`,
      };
    });
  }, []);

  const setPackageName = useCallback((value: string) => {
    setConfig(prev => ({
      ...prev,
      packageName: value,
      packageNameEditing: true,
    }));
  }, []);

  const resetPackageName = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      packageName: `${prev.groupId}.${derivePackageSuffix(prev.artifactId)}`,
      packageNameEditing: false,
    }));
  }, []);

  const setDependencies = useCallback((deps: string[]) => {
    setConfig(prev => ({ ...prev, dependencies: deps }));
  }, []);

  const toggleDependency = useCallback((id: string) => {
    setConfig(prev => {
      const has = prev.dependencies.includes(id);
      return {
        ...prev,
        dependencies: has
          ? prev.dependencies.filter(d => d !== id)
          : [...prev.dependencies, id],
      };
    });
  }, []);

  return {
    config,
    updateField,
    setGroupId: updateGroupId,
    setArtifactId: updateArtifactId,
    setPackageName,
    resetPackageName,
    setDependencies,
    toggleDependency,
  };
}

/** Fills still-empty config fields from metadata defaults. */
function mergeDefaults(
  prev: ProjectConfigState,
  metadata: InitializrMetadata
): ProjectConfigState {
  const d = metadata.defaults;
  const groupId = prev.groupId || d.groupId;
  const artifactId = prev.artifactId || d.artifactId;
  const packageName = prev.packageNameEditing
    ? prev.packageName
    : `${groupId}.${derivePackageSuffix(artifactId)}`;

  return {
    ...prev,
    bootVersion: prev.bootVersion || d.bootVersion,
    javaVersion: prev.javaVersion || d.javaVersion,
    language: prev.language || d.language,
    projectType: prev.projectType || d.projectType,
    packaging: prev.packaging || d.packaging,
    groupId,
    artifactId,
    name: prev.name || artifactId,
    packageName,
  };
}

/**
 * Derives a valid Java package suffix from an artifactId.
 * e.g. "ecommerce-api" → "ecommerceapi"
 */
export function derivePackageSuffix(artifactId: string): string {
  return (artifactId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
