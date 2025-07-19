/**
 * Sistema de Validación y Sanitización Robusto
 * Valida datos de entrada y los sanitiza para prevenir vulnerabilidades
 */

class ValidationSystem {
    constructor() {
        this.rules = new Map();
        this.customValidators = new Map();
        this.setupDefaultRules();
    }

    /**
     * Configurar reglas de validación por defecto
     */
    setupDefaultRules() {
        // Reglas para ingresos
        this.addRule('ingreso', {
            descripcion: {
                required: true,
                minLength: 3,
                maxLength: 100,
                sanitize: 'string'
            },
            monto: {
                required: true,
                type: 'number',
                min: 0.01,
                max: 999999999,
                sanitize: 'currency'
            },
            categoria: {
                required: true,
                enum: ['salario', 'freelance', 'inversiones', 'otros'],
                sanitize: 'string'
            },
            fecha: {
                required: true,
                type: 'date',
                sanitize: 'date'
            },
            es_recurrente: {
                type: 'boolean',
                default: false
            },
            frecuencia_recurrencia: {
                enum: ['semanal', 'quincenal', 'mensual', 'bimestral', 'trimestral', 'semestral', 'anual'],
                requiredIf: 'es_recurrente'
            }
        });

        // Reglas para gastos
        this.addRule('gasto', {
            descripcion: {
                required: true,
                minLength: 3,
                maxLength: 100,
                sanitize: 'string'
            },
            monto: {
                required: true,
                type: 'number',
                min: 0.01,
                max: 999999999,
                sanitize: 'currency'
            },
            categoria: {
                required: true,
                enum: ['vivienda', 'alimentacion', 'transporte', 'salud', 'entretenimiento', 'otros'],
                sanitize: 'string'
            },
            fecha: {
                required: true,
                type: 'date',
                sanitize: 'date'
            },
            estado: {
                enum: ['pendiente', 'pagado', 'vencido'],
                default: 'pendiente'
            }
        });
    }

    /**
     * Agregar regla de validación
     */
    addRule(entityType, rules) {
        this.rules.set(entityType, rules);
    }

    /**
     * Agregar validador personalizado
     */
    addCustomValidator(name, validatorFn) {
        this.customValidators.set(name, validatorFn);
    }

    /**
     * Validar y sanitizar datos
     */
    async validateAndSanitize(entityType, data) {
        const rules = this.rules.get(entityType);
        if (!rules) {
            throw new Error(`No hay reglas definidas para el tipo: ${entityType}`);
        }

        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            sanitizedData: {},
            metadata: {
                originalKeys: Object.keys(data),
                sanitizedKeys: [],
                addedDefaults: []
            }
        };

        // Procesar cada campo según sus reglas
        for (const [fieldName, fieldRules] of Object.entries(rules)) {
            try {
                const fieldResult = await this.validateField(
                    fieldName, 
                    data[fieldName], 
                    fieldRules, 
                    data
                );

                if (!fieldResult.isValid) {
                    result.isValid = false;
                    result.errors.push(...fieldResult.errors);
                }

                result.warnings.push(...fieldResult.warnings);
                
                if (fieldResult.hasValue) {
                    result.sanitizedData[fieldName] = fieldResult.sanitizedValue;
                    result.metadata.sanitizedKeys.push(fieldName);
                }

                if (fieldResult.wasDefault) {
                    result.metadata.addedDefaults.push(fieldName);
                }

            } catch (error) {
                result.isValid = false;
                result.errors.push(`Error en campo ${fieldName}: ${error.message}`);
            }
        }

        // Verificar campos adicionales no definidos en reglas
        for (const key of Object.keys(data)) {
            if (!rules[key]) {
                result.warnings.push(`Campo no reconocido ignorado: ${key}`);
            }
        }

        return result;
    }

    /**
     * Validar un campo individual
     */
    async validateField(fieldName, value, rules, allData) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            sanitizedValue: value,
            hasValue: value !== undefined && value !== null,
            wasDefault: false
        };

        // Aplicar valor por defecto si es necesario
        if (!result.hasValue && rules.default !== undefined) {
            result.sanitizedValue = rules.default;
            result.hasValue = true;
            result.wasDefault = true;
        }

        // Validación de campo requerido
        if (rules.required && !result.hasValue) {
            result.isValid = false;
            result.errors.push(`El campo ${fieldName} es obligatorio`);
            return result;
        }

        // Validación condicional
        if (rules.requiredIf && this.shouldBeRequired(rules.requiredIf, allData) && !result.hasValue) {
            result.isValid = false;
            result.errors.push(`El campo ${fieldName} es obligatorio cuando se cumple la condición`);
            return result;
        }

        // Si no hay valor y no es requerido, retornar
        if (!result.hasValue) {
            return result;
        }

        // Sanitizar valor
        if (rules.sanitize) {
            try {
                result.sanitizedValue = this.sanitizeValue(result.sanitizedValue, rules.sanitize);
            } catch (error) {
                result.warnings.push(`Error al sanitizar ${fieldName}: ${error.message}`);
            }
        }

        // Validaciones por tipo
        const typeValidation = await this.validateType(result.sanitizedValue, rules.type);
        if (!typeValidation.isValid) {
            result.isValid = false;
            result.errors.push(`${fieldName}: ${typeValidation.error}`);
        }

        // Validaciones de longitud
        if (rules.minLength && result.sanitizedValue.length < rules.minLength) {
            result.isValid = false;
            result.errors.push(`${fieldName} debe tener al menos ${rules.minLength} caracteres`);
        }

        if (rules.maxLength && result.sanitizedValue.length > rules.maxLength) {
            result.isValid = false;
            result.errors.push(`${fieldName} no puede tener más de ${rules.maxLength} caracteres`);
        }

        // Validaciones numéricas
        if (rules.min !== undefined && Number(result.sanitizedValue) < rules.min) {
            result.isValid = false;
            result.errors.push(`${fieldName} debe ser mayor o igual a ${rules.min}`);
        }

        if (rules.max !== undefined && Number(result.sanitizedValue) > rules.max) {
            result.isValid = false;
            result.errors.push(`${fieldName} debe ser menor o igual a ${rules.max}`);
        }

        // Validación de enumeraciones
        if (rules.enum && !rules.enum.includes(result.sanitizedValue)) {
            result.isValid = false;
            result.errors.push(`${fieldName} debe ser uno de: ${rules.enum.join(', ')}`);
        }

        // Validaciones personalizadas
        if (rules.custom) {
            const customValidation = await this.runCustomValidation(
                fieldName, 
                result.sanitizedValue, 
                rules.custom, 
                allData
            );
            
            if (!customValidation.isValid) {
                result.isValid = false;
                result.errors.push(...customValidation.errors);
            }
            
            result.warnings.push(...customValidation.warnings);
        }

        return result;
    }

    /**
     * Validar tipo de dato
     */
    async validateType(value, expectedType) {
        if (!expectedType) {
            return { isValid: true };
        }

        switch (expectedType) {
            case 'string':
                return {
                    isValid: typeof value === 'string',
                    error: 'Debe ser un texto'
                };
            
            case 'number':
                const num = Number(value);
                return {
                    isValid: !isNaN(num) && isFinite(num),
                    error: 'Debe ser un número válido'
                };
            
            case 'boolean':
                return {
                    isValid: typeof value === 'boolean',
                    error: 'Debe ser verdadero o falso'
                };
            
            case 'date':
                const date = new Date(value);
                return {
                    isValid: date instanceof Date && !isNaN(date),
                    error: 'Debe ser una fecha válida'
                };
            
            default:
                return { isValid: true };
        }
    }

    /**
     * Sanitizar valor según el tipo especificado
     */
    sanitizeValue(value, sanitizeType) {
        switch (sanitizeType) {
            case 'string':
                return String(value).trim().replace(/\s+/g, ' ');
            
            case 'currency':
                // Sanitizar moneda: convertir a número y redondear a 2 decimales
                const num = parseFloat(String(value).replace(/[^\d.-]/g, ''));
                return Math.round(num * 100) / 100;
            
            case 'date':
                const date = new Date(value);
                return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            
            case 'email':
                return String(value).toLowerCase().trim();
            
            case 'phone':
                return String(value).replace(/[^\d+()-\s]/g, '');
            
            default:
                return value;
        }
    }

    /**
     * Verificar si un campo debe ser requerido basado en condiciones
     */
    shouldBeRequired(condition, allData) {
        if (typeof condition === 'string') {
            // Condición simple: requiredIf: 'es_recurrente'
            return !!allData[condition];
        }
        
        if (typeof condition === 'object') {
            // Condición compleja: requiredIf: { field: 'es_recurrente', value: true }
            return allData[condition.field] === condition.value;
        }
        
        return false;
    }

    /**
     * Ejecutar validación personalizada
     */
    async runCustomValidation(fieldName, value, customRules, allData) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        if (Array.isArray(customRules)) {
            for (const rule of customRules) {
                const customResult = await this.runSingleCustomValidation(fieldName, value, rule, allData);
                if (!customResult.isValid) {
                    result.isValid = false;
                    result.errors.push(...customResult.errors);
                }
                result.warnings.push(...customResult.warnings);
            }
        } else {
            const customResult = await this.runSingleCustomValidation(fieldName, value, customRules, allData);
            result.isValid = customResult.isValid;
            result.errors = customResult.errors;
            result.warnings = customResult.warnings;
        }

        return result;
    }

    /**
     * Ejecutar una validación personalizada individual
     */
    async runSingleCustomValidation(fieldName, value, rule, allData) {
        if (typeof rule === 'string' && this.customValidators.has(rule)) {
            return await this.customValidators.get(rule)(fieldName, value, allData);
        }
        
        if (typeof rule === 'function') {
            return await rule(fieldName, value, allData);
        }
        
        return {
            isValid: true,
            errors: [],
            warnings: [`Validación personalizada no reconocida: ${rule}`]
        };
    }

    /**
     * Validación rápida (solo verificar si es válido)
     */
    async isValid(entityType, data) {
        const result = await this.validateAndSanitize(entityType, data);
        return result.isValid;
    }
}

// Validadores personalizados comunes
const setupCustomValidators = (validator) => {
    // Validador para moneda mexicana
    validator.addCustomValidator('mxn-currency', (fieldName, value) => {
        const num = Number(value);
        return {
            isValid: num >= 0 && num <= 999999999,
            errors: num < 0 ? ['El monto no puede ser negativo'] : 
                   num > 999999999 ? ['El monto es demasiado grande'] : [],
            warnings: []
        };
    });

    // Validador para fechas futuras
    validator.addCustomValidator('future-date', (fieldName, value) => {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return {
            isValid: date >= today,
            errors: date < today ? ['La fecha no puede ser anterior a hoy'] : [],
            warnings: []
        };
    });

    // Validador para descripciones financieras
    validator.addCustomValidator('financial-description', (fieldName, value) => {
        const forbidden = ['test', 'prueba', 'asdf', '123'];
        const hasForbitten = forbidden.some(word => 
            value.toLowerCase().includes(word)
        );
        
        return {
            isValid: !hasForbitten,
            errors: hasForbitten ? ['La descripción parece ser de prueba'] : [],
            warnings: []
        };
    });
};

// Crear instancia global
window.ValidationSystem = new ValidationSystem();
setupCustomValidators(window.ValidationSystem);
