import { useState } from 'react';

/**
 * The VS Code API available inside the webview.
 * In production, provided by VS Code via `acquireVsCodeApi()`.
 * In local dev (npm run dev), a mock is used so the UI can run in a browser.
 */
export interface VsCodeApi {
  postMessage: (message: unknown) => void;
  getState: () => Record<string, unknown>;
  setState: (state: Record<string, unknown>) => void;
}

// ---- Mock for local browser dev --------------------------------------------

let _mockState: Record<string, unknown> = {};

const mockVsCodeApi: VsCodeApi = {
  postMessage: (message: unknown) => {
    // Simulate a brief delay then echo back mock responses
    setTimeout(() => {
      const msg = message as { type?: string };
      if (msg?.type === 'initializationRequest') {
        window.postMessage(
          {
            type: 'metadataLoaded',
            payload: {
              bootVersions: [
                { id: '3.4.1', name: '3.4.1' },
                { id: '3.3.6', name: '3.3.6' },
              ],
              javaVersions: [
                { id: '21', name: '21' },
                { id: '17', name: '17' },
              ],
              languages: [{ id: 'java', name: 'Java' }],
              projectTypes: [
                { id: 'maven-project', name: 'Maven' },
                { id: 'gradle-project', name: 'Gradle' },
                { id: 'gradle-project-kotlin', name: 'Gradle (Kotlin)' },
              ],
              packagingTypes: [
                { id: 'jar', name: 'Jar' },
                { id: 'war', name: 'War' },
              ],
              dependencyGroups: [
                {
                  name: 'Web',
                  dependencies: [
                    {
                      id: 'web',
                      name: 'Spring Web',
                      description: 'Build web applications with Spring MVC and Tomcat',
                    },
                    {
                      id: 'webflux',
                      name: 'Reactive Web',
                      description: 'Build reactive web applications with Spring WebFlux',
                    },
                  ],
                },
                {
                  name: 'SQL',
                  dependencies: [
                    {
                      id: 'data-jpa',
                      name: 'Spring Data JPA',
                      description: 'Persist data with Java Persistence API and Hibernate',
                    },
                    {
                      id: 'postgresql',
                      name: 'PostgreSQL Driver',
                      description: 'JDBC driver for PostgreSQL',
                    },
                    {
                      id: 'h2',
                      name: 'H2 Database',
                      description: 'In-memory database for development and tests',
                    },
                  ],
                },
                {
                  name: 'Security',
                  dependencies: [
                    {
                      id: 'security',
                      name: 'Spring Security',
                      description: 'Highly customizable authentication and access control',
                    },
                  ],
                },
                {
                  name: 'Developer Tools',
                  dependencies: [
                    {
                      id: 'devtools',
                      name: 'Spring Boot DevTools',
                      description: 'Fast application restarts and live reload',
                    },
                    {
                      id: 'configuration-processor',
                      name: 'Configuration Processor',
                      description: 'Generate metadata for your configuration keys',
                    },
                  ],
                },
                {
                  name: 'Testing',
                  dependencies: [
                    {
                      id: 'testcontainers',
                      name: 'Testcontainers',
                      description: 'Provide lightweight, throwaway databases for tests',
                    },
                  ],
                },
              ],
              defaults: {
                bootVersion: '3.4.1',
                javaVersion: '21',
                language: 'java',
                projectType: 'maven-project',
                packaging: 'jar',
                groupId: 'com.example',
                artifactId: 'demo',
              },
            },
          },
          '*',
        );

        // Provide workspace context shortly after metadata.
        setTimeout(() => {
          window.postMessage(
            {
              type: 'WORKSPACE_INFO',
              payload: { workspaceFolder: 'D:\\workspace\\demo', projectName: 'demo' },
            },
            '*',
          );
        }, 50);
      } else if (msg?.type === 'SELECT_FOLDER') {
        window.postMessage(
          { type: 'FOLDER_SELECTED', payload: { path: 'D:\\workspace\\chosen-folder' } },
          '*',
        );
      }
    }, 300);
  },
  getState: () => _mockState,
  setState: (state: Record<string, unknown>) => {
    _mockState = state;
  },
};

// ---- Hook ------------------------------------------------------------------

/**
 * Returns the VS Code API object. In production this calls `acquireVsCodeApi()`
 * exactly once per webview session (subsequent calls throw), so it is resolved
 * lazily via a state initializer that runs a single time.
 */
export function useVsCodeApi(): VsCodeApi {
  const [api] = useState<VsCodeApi>(() => {
    // @ts-expect-error — acquireVsCodeApi is injected by VS Code at runtime
    if (typeof acquireVsCodeApi === 'function') {
      // @ts-expect-error — acquireVsCodeApi is injected by VS Code at runtime
      return acquireVsCodeApi() as VsCodeApi;
    }
    return mockVsCodeApi;
  });

  return api;
}