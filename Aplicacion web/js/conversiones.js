// JavaScript para el conversor de bases numéricas
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const inputNumber = document.getElementById('inputNumber');
    const fromBase = document.getElementById('fromBase');
    const toBase = document.getElementById('toBase');
    const validationMessage = document.getElementById('validationMessage');
    const resultSection = document.getElementById('resultSection');
    const resultNumber = document.getElementById('resultNumber');
    const resultBase = document.getElementById('resultBase');
    const allConversions = document.getElementById('allConversions');
    const processExplanation = document.getElementById('processExplanation');
    
    // Elementos de conversiones individuales
    const binaryResult = document.getElementById('binaryResult');
    const octalResult = document.getElementById('octalResult');
    const decimalResult = document.getElementById('decimalResult');
    const hexResult = document.getElementById('hexResult');
    
    // Elementos de las pestañas de ejemplos
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Funcionalidad de pestañas
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remover clase active de todos los botones y contenidos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Agregar clase active al botón clickeado y su contenido correspondiente
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Validación en tiempo real
    inputNumber.addEventListener('input', function() {
        validateInput();
    });

    fromBase.addEventListener('change', function() {
        validateInput();
        autoConvert();
    });

    toBase.addEventListener('change', function() {
        autoConvert();
    });

    // Conversión automática al cambiar el input
    inputNumber.addEventListener('input', function() {
        validateInput();
        autoConvert();
    });

    // Función para conversión automática
    function autoConvert() {
        if (inputNumber.value.trim() && validateInput()) {
            performConversion();
        } else if (!inputNumber.value.trim()) {
            // Limpiar resultados si no hay input
            clearResults();
        }
    }

    // Función de validación
    function validateInput() {
        const value = inputNumber.value.trim().toUpperCase();
        const base = parseInt(fromBase.value);
        
        if (!value) {
            showValidation('Ingresa un número para convertir', 'error');
            return false;
        }

        // Definir caracteres válidos para cada base (incluyendo punto decimal)
        const validChars = {
            2: /^[01]+(\.[01]+)?$/,
            8: /^[0-7]+(\.[0-7]+)?$/,
            10: /^[0-9]+(\.[0-9]+)?$/,
            16: /^[0-9A-F]+(\.[0-9A-F]+)?$/
        };

        if (!validChars[base].test(value)) {
            const baseNames = {2: 'binario', 8: 'octal', 10: 'decimal', 16: 'hexadecimal'};
            const validCharsList = {
                2: '0, 1 (y punto decimal)',
                8: '0-7 (y punto decimal)',
                10: '0-9 (y punto decimal)',
                16: '0-9, A-F (y punto decimal)'
            };
            showValidation(`Número inválido para base ${baseNames[base]}. Usa solo: ${validCharsList[base]}`, 'error');
            return false;
        }

        showValidation('✓ Número válido', 'success');
        return true;
    }

    // Mostrar mensajes de validación
    function showValidation(message, type) {
        validationMessage.textContent = message;
        validationMessage.className = `input-validation validation-${type}`;
    }

    // Función principal de conversión
    function performConversion() {
        const value = inputNumber.value.trim().toUpperCase();
        const fromBaseValue = parseInt(fromBase.value);
        const toBaseValue = parseInt(toBase.value);

        try {
            // Convertir a decimal primero
            const decimalValue = toDecimal(value, fromBaseValue);
            
            // Convertir de decimal a la base destino
            const result = fromDecimal(decimalValue, toBaseValue);
            
            // Mostrar resultado principal
            displayResult(result, toBaseValue);
            
            // Mostrar todas las conversiones
            displayAllConversions(decimalValue);
            
            // Mostrar explicación del proceso
            showProcessExplanation(value, fromBaseValue, toBaseValue, decimalValue, result);
            
        } catch (error) {
            showValidation('Error en la conversión: ' + error.message, 'error');
        }
    }

    // Convertir cualquier base a decimal
    function toDecimal(value, base) {
        if (base === 10) return parseFloat(value);
        
        // Separar parte entera y decimal
        const parts = value.split('.');
        const integerPart = parts[0] || '0';
        const fractionalPart = parts[1] || '';
        
        let decimal = 0;
        
        // Convertir parte entera
        const integerDigits = integerPart.split('').reverse();
        for (let i = 0; i < integerDigits.length; i++) {
            const digit = integerDigits[i];
            let digitValue = getDigitValue(digit);
            
            if (digitValue >= base) {
                throw new Error(`Dígito ${digit} no válido para base ${base}`);
            }
            
            decimal += digitValue * Math.pow(base, i);
        }
        
        // Convertir parte fraccionaria
        if (fractionalPart) {
            const fractionalDigits = fractionalPart.split('');
            for (let i = 0; i < fractionalDigits.length; i++) {
                const digit = fractionalDigits[i];
                let digitValue = getDigitValue(digit);
                
                if (digitValue >= base) {
                    throw new Error(`Dígito ${digit} no válido para base ${base}`);
                }
                
                decimal += digitValue * Math.pow(base, -(i + 1));
            }
        }
        
        return decimal;
    }
    
    // Función auxiliar para obtener el valor numérico de un dígito
    function getDigitValue(digit) {
        if (digit >= '0' && digit <= '9') {
            return parseInt(digit);
        } else {
            return digit.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
        }
    }

    // Convertir decimal a cualquier base
    function fromDecimal(decimal, base) {
        if (base === 10) {
            // Mostrar número completo sin redondeo artificial
            return decimal.toString();
        }
        if (decimal === 0) return '0';
        
        // Separar parte entera y fraccionaria
        const integerPart = Math.floor(Math.abs(decimal));
        const fractionalPart = Math.abs(decimal) - integerPart;
        
        let result = '';
        
        // Convertir parte entera
        if (integerPart === 0) {
            result = '0';
        } else {
            let num = integerPart;
            while (num > 0) {
                const remainder = num % base;
                result = getDigitChar(remainder) + result;
                num = Math.floor(num / base);
            }
        }
        
        // Convertir parte fraccionaria (aumentar a 15 dígitos para mayor precisión)
        if (fractionalPart > 0) {
            result += '.';
            let frac = fractionalPart;
            let maxDigits = 15; // Aumentar precisión
            
            while (frac > 1e-15 && maxDigits > 0) { // Usar menor tolerancia
                frac *= base;
                const digit = Math.floor(frac);
                result += getDigitChar(digit);
                frac -= digit;
                maxDigits--;
            }
            
            // Solo remover ceros finales si hay muchos (más de 2 consecutivos)
            result = result.replace(/0{3,}$/, '');
            // Remover punto final si no hay decimales
            result = result.replace(/\.$/, '');
        }
        
        // Agregar signo si es negativo
        if (decimal < 0) {
            result = '-' + result;
        }
        
        return result;
    }
    
    // Función auxiliar para obtener el carácter de un dígito
    function getDigitChar(digitValue) {
        if (digitValue < 10) {
            return digitValue.toString();
        } else {
            return String.fromCharCode('A'.charCodeAt(0) + digitValue - 10);
        }
    }

    // Mostrar resultado principal
    function displayResult(result, base) {
        const baseNames = {2: 'Binario', 8: 'Octal', 10: 'Decimal', 16: 'Hexadecimal'};
        const baseSubscripts = {2: '₂', 8: '₈', 10: '₁₀', 16: '₁₆'};
        
        resultNumber.textContent = result + baseSubscripts[base];
        resultBase.textContent = `(${baseNames[base]} - Base ${base})`;
        
        resultSection.classList.add('show');
    }

    // Mostrar todas las conversiones
    function displayAllConversions(decimalValue) {
        // Mostrar todas las conversiones con máxima precisión
        binaryResult.textContent = fromDecimal(decimalValue, 2) + '₂';
        octalResult.textContent = fromDecimal(decimalValue, 8) + '₈';
        decimalResult.textContent = decimalValue.toString() + '₁₀'; // Mostrar número completo
        hexResult.textContent = fromDecimal(decimalValue, 16) + '₁₆';
        
        allConversions.classList.add('show');
    }

    // Mostrar explicación del proceso
    function showProcessExplanation(originalValue, fromBaseValue, toBaseValue, decimalValue, result) {
        const baseNames = {2: 'binario', 8: 'octal', 10: 'decimal', 16: 'hexadecimal'};
        
        let explanation = `<h5>🔍 Proceso de Conversión:</h5>`;
        
        if (fromBaseValue !== 10) {
            explanation += `<div class="process-step">
                <strong>Paso 1:</strong> Convertir ${originalValue} (base ${fromBaseValue}) a decimal
            </div>`;
            explanation += generateToDecimalSteps(originalValue, fromBaseValue, decimalValue);
        }
        
        if (toBaseValue !== 10) {
            explanation += `<div class="process-step">
                <strong>Paso ${fromBaseValue !== 10 ? '2' : '1'}:</strong> Convertir ${decimalValue} (decimal) a base ${toBaseValue}
            </div>`;
            explanation += generateFromDecimalSteps(decimalValue, toBaseValue, result);
        }
        
        if (fromBaseValue === 10 && toBaseValue === 10) {
            explanation += `<div class="process-step">
                <strong>Resultado:</strong> No se requiere conversión (ambas bases son decimales)
            </div>`;
        }
        
        processExplanation.innerHTML = explanation;
        processExplanation.classList.add('show');
    }

    // Generar pasos para conversión a decimal
    function generateToDecimalSteps(value, base, decimal) {
        let steps = '';
        
        // Separar parte entera y decimal
        const parts = value.split('.');
        const integerPart = parts[0] || '0';
        const fractionalPart = parts[1] || '';
        
        let calculation = [];
        
        // Procesar parte entera
        const integerDigits = integerPart.split('').reverse();
        for (let i = 0; i < integerDigits.length; i++) {
            const digit = integerDigits[i];
            const digitValue = getDigitValue(digit);
            const power = Math.pow(base, i);
            const term = `${digit}×${base}^${i}`;
            const termValue = `${digitValue}×${power}`;
            calculation.push({term, termValue, value: digitValue * power, position: i});
        }
        
        // Procesar parte fraccionaria
        if (fractionalPart) {
            const fractionalDigits = fractionalPart.split('');
            for (let i = 0; i < fractionalDigits.length; i++) {
                const digit = fractionalDigits[i];
                const digitValue = getDigitValue(digit);
                const power = Math.pow(base, -(i + 1));
                const term = `${digit}×${base}^-${i + 1}`;
                const termValue = `${digitValue}×${power.toFixed(6)}`;
                calculation.push({term, termValue, value: digitValue * power, position: -(i + 1)});
            }
        }
        
        // Ordenar por posición (de mayor a menor)
        calculation.sort((a, b) => b.position - a.position);
        
        steps += `<div class="process-step">`;
        steps += calculation.map(c => c.term).join(' + ') + ' = ';
        steps += calculation.map(c => c.termValue).join(' + ') + ' = ';
        steps += calculation.map(c => c.value.toString()).join(' + ') + ' = ' + decimal.toString();
        steps += `</div>`;
        
        return steps;
    }

    // Generar pasos para conversión desde decimal
    function generateFromDecimalSteps(decimal, base, result) {
        let steps = '';
        
        // Separar parte entera y fraccionaria
        const integerPart = Math.floor(Math.abs(decimal));
        const fractionalPart = Math.abs(decimal) - integerPart;
        
        // Conversión de parte entera
        if (integerPart > 0) {
            steps += `<div class="process-step"><strong>Parte entera (${integerPart}):</strong></div>`;
            let num = integerPart;
            let divisions = [];
            
            while (num > 0) {
                const quotient = Math.floor(num / base);
                const remainder = num % base;
                const remainderChar = getDigitChar(remainder);
                
                divisions.push({
                    dividend: num,
                    quotient: quotient,
                    remainder: remainderChar
                });
                
                num = quotient;
            }
            
            divisions.forEach(div => {
                steps += `<div class="process-step">
                    ${div.dividend} ÷ ${base} = ${div.quotient} resto ${div.remainder}
                </div>`;
            });
            
            const remainders = divisions.map(d => d.remainder).reverse().join('');
            steps += `<div class="process-step">
                <strong>Parte entera:</strong> ${remainders}
            </div>`;
        } else {
            steps += `<div class="process-step"><strong>Parte entera:</strong> 0</div>`;
        }
        
        // Conversión de parte fraccionaria
        if (fractionalPart > 0) {
            steps += `<div class="process-step"><strong>Parte fraccionaria (${fractionalPart.toString()}):</strong></div>`;
            let frac = fractionalPart;
            let fractionalDigits = [];
            let maxDigits = 15; // Aumentar precisión
            
            while (frac > 1e-15 && maxDigits > 0) { // Usar menor tolerancia
                frac *= base;
                const digit = Math.floor(frac);
                const digitChar = getDigitChar(digit);
                
                steps += `<div class="process-step">
                    ${(frac / base).toString()} × ${base} = ${frac.toString()} → dígito: ${digitChar}
                </div>`;
                
                fractionalDigits.push(digitChar);
                frac -= digit;
                maxDigits--;
            }
            
            steps += `<div class="process-step">
                <strong>Parte fraccionaria:</strong> .${fractionalDigits.join('')}
            </div>`;
        }
        
        return steps;
    }



    // Función para limpiar resultados
    function clearResults() {
        resultSection.classList.remove('show');
        allConversions.classList.remove('show');
        processExplanation.classList.remove('show');
        
        resultNumber.textContent = 'Ingresa un número para ver la conversión';
        resultBase.textContent = '';
        binaryResult.textContent = '-';
        octalResult.textContent = '-';
        decimalResult.textContent = '-';
        hexResult.textContent = '-';
        processExplanation.innerHTML = '';
    }

    console.log('Conversor de bases inicializado correctamente');
});