import * as fs from 'fs';
import * as path from 'path';
import { ProjectConfiguration } from '../initializr/types';
import { Logger } from '../utils/logger';

export class ScaffoldingService {
    /**
     * Generates a complete vertical CRUD slice for the given entity name.
     */
    static async generateCrudModule(targetPath: string, config: ProjectConfiguration): Promise<void> {
        const entityName = config.scaffoldEntity?.trim();
        if (!entityName || config.architecture.type !== 'rest-api') {
            return;
        }

        // TitleCase and camelCase forms of the entity
        const EntityName = entityName.charAt(0).toUpperCase() + entityName.slice(1);
        const entityNameLower = entityName.charAt(0).toLowerCase() + entityName.slice(1);

        const mainJavaPath = path.join(targetPath, 'src', 'main', 'java');
        const basePackageDir = this._findBasePackageDir(mainJavaPath);
        
        if (!basePackageDir) {
            Logger.warn('Could not detect base package directory for scaffolding.');
            return;
        }

        const basePackage = this._pathToPackage(mainJavaPath, basePackageDir);
        Logger.info(`Scaffolding module for ${EntityName} in package ${basePackage}`);

        this._generateEntity(basePackageDir, basePackage, EntityName);
        this._generateRepository(basePackageDir, basePackage, EntityName);
        this._generateDtos(basePackageDir, basePackage, EntityName, config.architecture.dto);
        this._generateService(basePackageDir, basePackage, EntityName, entityNameLower);
        this._generateController(basePackageDir, basePackage, EntityName, entityNameLower, config.architecture.apiResponse);
    }

    private static _findBasePackageDir(currentDir: string): string | null {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        if (entries.some(e => e.isFile() && e.name.endsWith('.java'))) return currentDir;
        const dirs = entries.filter(e => e.isDirectory());
        if (dirs.length === 1) return this._findBasePackageDir(path.join(currentDir, dirs[0].name));
        return null;
    }

    private static _pathToPackage(mainJavaPath: string, basePackageDir: string): string {
        const relPath = path.relative(mainJavaPath, basePackageDir);
        return relPath.replace(/[\\/]/g, '.');
    }

    private static _generateEntity(baseDir: string, basePackage: string, EntityName: string) {
        const content = `package ${basePackage}.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "${EntityName.toLowerCase()}s")
public class ${EntityName} {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Default constructor for JPA
    public ${EntityName}() {}

    public ${EntityName}(String name) {
        this.name = name;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
`;
        fs.writeFileSync(path.join(baseDir, 'entity', `${EntityName}.java`), content);
    }

    private static _generateRepository(baseDir: string, basePackage: string, EntityName: string) {
        const content = `package ${basePackage}.repository;

import ${basePackage}.entity.${EntityName};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ${EntityName}Repository extends JpaRepository<${EntityName}, Long> {
}
`;
        fs.writeFileSync(path.join(baseDir, 'repository', `${EntityName}Repository.java`), content);
    }

    private static _generateDtos(baseDir: string, basePackage: string, EntityName: string, useDtos: boolean) {
        if (!useDtos) return;
        
        const reqContent = `package ${basePackage}.dto.request;

import jakarta.validation.constraints.NotBlank;

public class ${EntityName}Request {
    @NotBlank(message = "Name is required")
    private String name;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
`;
        fs.writeFileSync(path.join(baseDir, 'dto', 'request', `${EntityName}Request.java`), reqContent);

        const resContent = `package ${basePackage}.dto.response;

import ${basePackage}.entity.${EntityName};
import java.time.LocalDateTime;

public class ${EntityName}Response {
    private Long id;
    private String name;
    private LocalDateTime createdAt;

    public static ${EntityName}Response fromEntity(${EntityName} entity) {
        ${EntityName}Response response = new ${EntityName}Response();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setCreatedAt(entity.getCreatedAt());
        return response;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
`;
        fs.writeFileSync(path.join(baseDir, 'dto', 'response', `${EntityName}Response.java`), resContent);
    }

    private static _generateService(baseDir: string, basePackage: string, EntityName: string, entityNameLower: string) {
        const interfaceContent = `package ${basePackage}.service;

import ${basePackage}.entity.${EntityName};
import java.util.List;

public interface ${EntityName}Service {
    ${EntityName} create${EntityName}(String name);
    ${EntityName} get${EntityName}ById(Long id);
    List<${EntityName}> getAll${EntityName}s();
    ${EntityName} update${EntityName}(Long id, String name);
    void delete${EntityName}(Long id);
}
`;
        fs.writeFileSync(path.join(baseDir, 'service', `${EntityName}Service.java`), interfaceContent);

        const implDir = path.join(baseDir, 'service', 'impl');
        fs.mkdirSync(implDir, { recursive: true });

        const implContent = `package ${basePackage}.service.impl;

import ${basePackage}.entity.${EntityName};
import ${basePackage}.repository.${EntityName}Repository;
import ${basePackage}.service.${EntityName}Service;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ${EntityName}ServiceImpl implements ${EntityName}Service {

    private final ${EntityName}Repository repository;

    public ${EntityName}ServiceImpl(${EntityName}Repository repository) {
        this.repository = repository;
    }

    @Override
    public ${EntityName} create${EntityName}(String name) {
        ${EntityName} entity = new ${EntityName}(name);
        return repository.save(entity);
    }

    @Override
    public ${EntityName} get${EntityName}ById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("${EntityName} not found with id: " + id));
    }

    @Override
    public List<${EntityName}> getAll${EntityName}s() {
        return repository.findAll();
    }

    @Override
    public ${EntityName} update${EntityName}(Long id, String name) {
        ${EntityName} entity = get${EntityName}ById(id);
        entity.setName(name);
        return repository.save(entity);
    }

    @Override
    public void delete${EntityName}(Long id) {
        repository.deleteById(id);
    }
}
`;
        fs.writeFileSync(path.join(implDir, `${EntityName}ServiceImpl.java`), implContent);
    }

    private static _generateController(baseDir: string, basePackage: string, EntityName: string, entityNameLower: string, useApiResponse: boolean) {
        const returnType = useApiResponse ? `ApiResponse<${EntityName}>` : `${EntityName}`;
        const returnListType = useApiResponse ? `ApiResponse<List<${EntityName}>>` : `List<${EntityName}>`;
        
        const successWrap = useApiResponse ? `return ApiResponse.success("Success", result);` : `return result;`;
        
        let imports = `import ${basePackage}.entity.${EntityName};\nimport ${basePackage}.service.${EntityName}Service;\n`;
        if (useApiResponse) {
            imports += `import ${basePackage}.dto.response.ApiResponse;\n`;
        }
        
        const content = `package ${basePackage}.controller;

${imports}
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/${entityNameLower}s")
public class ${EntityName}Controller {

    private final ${EntityName}Service service;

    public ${EntityName}Controller(${EntityName}Service service) {
        this.service = service;
    }

    @PostMapping
    public ${returnType} create(@RequestParam String name) {
        ${EntityName} result = service.create${EntityName}(name);
        ${successWrap}
    }

    @GetMapping("/{id}")
    public ${returnType} getById(@PathVariable Long id) {
        ${EntityName} result = service.get${EntityName}ById(id);
        ${successWrap}
    }

    @GetMapping
    public ${returnListType} getAll() {
        List<${EntityName}> result = service.getAll${EntityName}s();
        ${useApiResponse ? 'return ApiResponse.success("Success", result);' : 'return result;'}
    }

    @PutMapping("/{id}")
    public ${returnType} update(@PathVariable Long id, @RequestParam String name) {
        ${EntityName} result = service.update${EntityName}(id, name);
        ${successWrap}
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete${EntityName}(id);
    }
}
`;
        fs.writeFileSync(path.join(baseDir, 'controller', `${EntityName}Controller.java`), content);
    }
}
