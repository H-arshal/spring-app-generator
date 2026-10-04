import * as fs from 'fs';
import * as path from 'path';
import { ProjectConfiguration } from '../initializr/types';
import { Logger } from '../utils/logger';

export class ArchitectureService {
    /**
     * Applies the selected architecture and boilerplate to the generated project.
     * @param targetPath The root of the extracted Spring Boot project
     * @param config The user's configuration, including ArchitectureConfig
     */
    static async applyArchitecture(targetPath: string, config: ProjectConfiguration): Promise<void> {
        const arch = config.architecture;
        if (!arch || arch.type === 'minimal') {
            Logger.info('Minimal architecture selected. No boilerplate added.');
            return;
        }

        // 1. Locate the main Java package directory
        const mainJavaPath = path.join(targetPath, 'src', 'main', 'java');
        if (!fs.existsSync(mainJavaPath)) {
            Logger.warn('Could not find src/main/java. Skipping architecture generation.');
            return;
        }

        const basePackageDir = this._findBasePackageDir(mainJavaPath);
        if (!basePackageDir) {
            Logger.warn('Could not detect base package directory. Skipping architecture generation.');
            return;
        }

        const basePackage = this._pathToPackage(mainJavaPath, basePackageDir);
        Logger.info(`Applying ${arch.type} architecture to package: ${basePackage}`);

        // 2. Create the necessary directories based on architecture
        const dirs = this._getDirectoriesForArchitecture(arch.type);
        dirs.forEach(d => {
            const dirPath = path.join(basePackageDir, d);
            fs.mkdirSync(dirPath, { recursive: true });
        });

        // 3. Inject Boilerplate if requested
        if (arch.globalExceptionHandler) {
            this._generateGlobalExceptionHandler(basePackageDir, basePackage);
        }

        if (arch.dto) {
            fs.mkdirSync(path.join(basePackageDir, 'dto', 'request'), { recursive: true });
            fs.mkdirSync(path.join(basePackageDir, 'dto', 'response'), { recursive: true });
        }

        if (arch.apiResponse) {
            this._generateApiResponse(basePackageDir, basePackage);
        }

        Logger.info('Architecture boilerplate applied successfully.');
    }

    /**
     * Finds the deepest directory containing .java files inside src/main/java.
     * Spring Initializr creates exactly one package hierarchy leading to the Application class.
     */
    private static _findBasePackageDir(currentDir: string): string | null {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        
        // If there are Java files here, this is the base package
        if (entries.some(e => e.isFile() && e.name.endsWith('.java'))) {
            return currentDir;
        }

        // Otherwise, if there is exactly one directory, traverse down
        const dirs = entries.filter(e => e.isDirectory());
        if (dirs.length === 1) {
            return this._findBasePackageDir(path.join(currentDir, dirs[0].name));
        }

        return null;
    }

    private static _pathToPackage(mainJavaPath: string, basePackageDir: string): string {
        const relPath = path.relative(mainJavaPath, basePackageDir);
        return relPath.replace(/[\\/]/g, '.');
    }

    private static _getDirectoriesForArchitecture(type: string): string[] {
        if (type === 'layered') {
            return ['controller', 'service', 'repository', 'model', 'config'];
        }
        if (type === 'rest-api') {
            return ['config', 'controller', 'dto', 'entity', 'exception', 'repository', 'service'];
        }
        return [];
    }

    private static _generateGlobalExceptionHandler(baseDir: string, basePackage: string): void {
        const exceptionDir = path.join(baseDir, 'exception');
        fs.mkdirSync(exceptionDir, { recursive: true });

        const content = `package ${basePackage}.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllExceptions(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getMessage());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
`;
        fs.writeFileSync(path.join(exceptionDir, 'GlobalExceptionHandler.java'), content);
    }

    private static _generateApiResponse(baseDir: string, basePackage: string): void {
        const dtoResponseDir = path.join(baseDir, 'dto', 'response');
        fs.mkdirSync(dtoResponseDir, { recursive: true });

        const content = `package ${basePackage}.dto.response;

public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
}
`;
        fs.writeFileSync(path.join(dtoResponseDir, 'ApiResponse.java'), content);
    }
}
