// JavaScript para la calculadora de multiplicación binaria
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const multiplicandBinary = document.getElementById('multiplicandBinary');
    const multiplierBinary = document.getElementById('multiplierBinary');
    const calculateMultiplication = document.getElementById('calculateMultiplication');
    const validationMultiplicand = document.getElementById('validationMultiplicand');
    const validationMultiplier = document.getElementById('validationMultiplier');
    const operationDisplay = document.getElementById('operationDisplay');
    const displayMultiplicand = document.getElementById('displayMultiplicand');
    const displayMultiplier = document.getElementById('displayMultiplier');
    const displayResult = document.getElementById('displayResult');
    const decimalResult = document.getElementById('decimalResult');
    const decimalValue = document.getElementById('decimalValue');
    const stepExplanation = document.getElementById('stepExplanation');
    const visualProcess = document.getElementById('visualProcess');
    const stepTable = document.getElementById('stepTable');

    // Validación en tiempo real
    multiplicandBinary.addEventListener('input', function() {
        validateBinaryInput(this, validationMultiplicand);
    });

    multiplierBinary.addEventListener('input', function() {
        validateBinaryInput(this, validationMultiplier);
    });

    // Calcular multiplicación al hacer clic
    calculateMultiplication.addEventListener('click', function() {
        performBinaryMultiplication();
    });

    // Calcular multiplicación al presionar Enter
    multiplicandBinary.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performBinaryMultiplication();
    });

    multiplierBinary.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performBinaryMultiplication();
    });

    // Función para validar entrada binaria
    function validateBinaryInput(input, validationElement) {
        const value = input.value.trim();
        const binaryPattern = /^[01]+$/;

        if (!value) {
            showValidation(validationElement, '', '');
            return false;
        }

        if (!binaryPattern.test(value)) {
            showValidation(validationElement, 'Solo se permiten dígitos 0 y 1', 'error');
            return false;
        }

        if (value.length > 12) {
            showValidation(validationElement, 'Máximo 12 dígitos para evitar resultados muy largos', 'error');
            return false;
        }

        showValidation(validationElement, '✓ Número binario válido', 'success');
        return true;
    }

    // Mostrar mensajes de validación
    function showValidation(element, message, type) {
        element.textContent = message;
        element.className = `binary-validation validation-${type}`;
    }

    // Función principal para realizar la multiplicación binaria
    function performBinaryMultiplication() {
        const multiplicand = multiplicandBinary.value.trim();
        const multiplier = multiplierBinary.value.trim();

        // Validar ambos números
        const validMultiplicand = validateBinaryInput(multiplicandBinary, validationMultiplicand);
        const validMultiplier = validateBinaryInput(multiplierBinary, validationMultiplier);

        if (!validMultiplicand || !validMultiplier || !multiplicand || !multiplier) {
            alert('Por favor ingresa dos números binarios válidos');
            return;
        }

        // Realizar la multiplicación
        const result = multiplyBinaryNumbers(multiplicand, multiplier);
        
        // Mostrar resultados
        displayResults(multiplicand, multiplier, result);
        
        // Mostrar proceso paso a paso
        showStepByStep(multiplicand, multiplier, result);
    }

    // Función para multiplicar números binarios
    function multiplyBinaryNumbers(multiplicand, multiplier) {
        const partialProducts = [];
        const steps = [];
        
        // Generar productos parciales
        for (let i = 0; i < multiplier.length; i++) {
            const multiplierBit = multiplier[multiplier.length - 1 - i];
            let partialProduct;
            
            if (multiplierBit === '1') {
                // Multiplicar por 1: copiar el multiplicando y desplazar
                partialProduct = multiplicand + '0'.repeat(i);
            } else {
                // Multiplicar por 0: resultado es 0
                partialProduct = '0'.repeat(multiplicand.length + i);
            }
            
            partialProducts.push(partialProduct);
            
            steps.push({
                position: i,
                multiplierBit: multiplierBit,
                partialProduct: partialProduct,
                isZero: multiplierBit === '0'
            });
        }

        // Sumar todos los productos parciales
        let finalResult = addBinaryStrings(partialProducts);
        
        // Eliminar ceros a la izquierda
        finalResult = finalResult.replace(/^0+/, '') || '0';

        return {
            binary: finalResult,
            partialProducts: partialProducts,
            steps: steps,
            multiplicand: multiplicand,
            multiplier: multiplier
        };
    }

    // Función para sumar múltiples números binarios
    function addBinaryStrings(binaryArray) {
        if (binaryArray.length === 0) return '0';
        if (binaryArray.length === 1) return binaryArray[0];

        // Encontrar la longitud máxima
        const maxLength = Math.max(...binaryArray.map(bin => bin.length));
        
        // Igualar todas las longitudes
        const paddedArray = binaryArray.map(bin => bin.padStart(maxLength, '0'));
        
        let result = '';
        let carry = 0;

        // Sumar columna por columna de derecha a izquierda
        for (let i = maxLength - 1; i >= 0; i--) {
            let sum = carry;
            
            // Sumar todos los dígitos en esta posición
            for (let j = 0; j < paddedArray.length; j++) {
                sum += parseInt(paddedArray[j][i]);
            }
            
            // Calcular resultado y nuevo carry
            result = (sum % 2) + result;
            carry = Math.floor(sum / 2);
        }

        // Agregar carry final si existe
        if (carry > 0) {
            result = carry.toString(2) + result;
        }

        return result;
    }

    // Mostrar resultados
    function displayResults(multiplicand, multiplier, result) {
        displayMultiplicand.textContent = multiplicand;
        displayMultiplier.textContent = multiplier;
        displayResult.textContent = result.binary;
        
        operationDisplay.style.display = 'grid';

        // Mostrar equivalencia decimal
        const decMultiplicand = parseInt(multiplicand, 2);
        const decMultiplier = parseInt(multiplier, 2);
        const decResult = parseInt(result.binary, 2);
        
        decimalValue.textContent = `${decMultiplicand} × ${decMultiplier} = ${decResult}`;
        decimalResult.style.display = 'block';
    }

    // Mostrar explicación paso a paso
    function showStepByStep(multiplicand, multiplier, result) {
        createMultiplicationProcess(result);
        createStepTable(result);
        stepExplanation.classList.add('show');
    }

    // Crear proceso visual de multiplicación
    function createMultiplicationProcess(result) {
        let html = '<div class="visual-multiplication">';
        
        // Configuración inicial
        html += '<div class="multiplication-step">';
        html += '<div class="multiplication-step-title">Configuración inicial:</div>';
        html += '<div class="multiplication-partial">';
        html += `<div style="text-align: right;">    ${result.multiplicand}  (${parseInt(result.multiplicand, 2)} en decimal)</div>`;
        html += `<div style="text-align: right;">×   ${result.multiplier}  (${parseInt(result.multiplier, 2)} en decimal)</div>`;
        html += `<div style="text-align: right;">${'-'.repeat(Math.max(result.multiplicand.length, result.multiplier.length) + 4)}</div>`;
        html += '</div>';
        html += '</div>';

        // Productos parciales
        result.steps.forEach((step, index) => {
            html += '<div class="multiplication-step">';
            
            if (step.isZero) {
                html += `<div class="multiplication-step-title">Paso ${index + 1}: ${result.multiplicand} × ${step.multiplierBit} (posición ${step.position})</div>`;
                html += '<div class="multiplication-partial">0 (multiplicar por 0 da 0)</div>';
            } else {
                html += `<div class="multiplication-step-title">Paso ${index + 1}: ${result.multiplicand} × ${step.multiplierBit} (posición ${step.position})</div>`;
                const shifted = step.position > 0 ? ` desplazado ${step.position} posición${step.position > 1 ? 'es' : ''}` : '';
                html += `<div class="multiplication-partial">${step.partialProduct}${shifted}</div>`;
            }
            
            html += '</div>';
        });

        // Suma de productos parciales
        html += '<div class="multiplication-step">';
        html += '<div class="multiplication-step-title">Suma de productos parciales:</div>';
        html += '<div class="multiplication-partial">';
        
        const maxLength = Math.max(...result.partialProducts.map(p => p.length));
        
        result.partialProducts.forEach((product, index) => {
            const paddedProduct = product.padStart(maxLength, ' ');
            const prefix = index === result.partialProducts.length - 1 ? '+' : ' ';
            html += `<div style="font-family: monospace; text-align: right;">${prefix} ${paddedProduct}</div>`;
        });
        
        html += `<div style="font-family: monospace; text-align: right;">${'-'.repeat(maxLength + 2)}</div>`;
        const paddedResult = result.binary.padStart(maxLength, ' ');
        html += `<div style="font-family: monospace; text-align: right; font-weight: bold; color: #27ae60;">  ${paddedResult}</div>`;
        html += '</div>';
        html += '</div>';

        html += '</div>';
        
        visualProcess.innerHTML = html;
    }

    // Crear tabla de pasos
    function createStepTable(result) {
        let html = '<table class="step-table">';
        html += '<thead><tr>';
        html += '<th>Paso</th>';
        html += '<th>Bit del Multiplicador</th>';
        html += '<th>Posición</th>';
        html += '<th>Operación</th>';
        html += '<th>Producto Parcial</th>';
        html += '<th>Explicación</th>';
        html += '</tr></thead><tbody>';

        result.steps.forEach((step, index) => {
            html += '<tr>';
            html += `<td class="position-cell">${index + 1}</td>`;
            html += `<td class="result-cell">${step.multiplierBit}</td>`;
            html += `<td>${step.position}</td>`;
            
            if (step.isZero) {
                html += `<td>${result.multiplicand} × 0</td>`;
                html += `<td class="result-cell">0</td>`;
                html += '<td>Multiplicar por 0 siempre da 0</td>';
            } else {
                html += `<td>${result.multiplicand} × 1</td>`;
                html += `<td class="result-cell">${step.partialProduct}</td>`;
                
                if (step.position === 0) {
                    html += '<td>Multiplicar por 1 copia el multiplicando</td>';
                } else {
                    html += `<td>Multiplicar por 1 y desplazar ${step.position} posición${step.position > 1 ? 'es' : ''} a la izquierda</td>`;
                }
            }
            
            html += '</tr>';
        });

        // Fila de suma final
        html += '<tr style="background-color: rgba(39, 174, 96, 0.1);">';
        html += '<td colspan="4"><strong>Suma Final</strong></td>';
        html += `<td class="result-cell"><strong>${result.binary}</strong></td>`;
        html += '<td><strong>Sumar todos los productos parciales</strong></td>';
        html += '</tr>';

        html += '</tbody></table>';
        
        stepTable.innerHTML = html;
    }

    // Función auxiliar para sumar dos números binarios
    function addTwoBinaryStrings(bin1, bin2) {
        const maxLength = Math.max(bin1.length, bin2.length);
        const num1 = bin1.padStart(maxLength, '0');
        const num2 = bin2.padStart(maxLength, '0');
        
        let result = '';
        let carry = 0;

        for (let i = maxLength - 1; i >= 0; i--) {
            const digit1 = parseInt(num1[i]);
            const digit2 = parseInt(num2[i]);
            const sum = digit1 + digit2 + carry;

            result = (sum % 2) + result;
            carry = Math.floor(sum / 2);
        }

        if (carry > 0) {
            result = carry + result;
        }

        return result;
    }

    console.log('Calculadora de multiplicación binaria inicializada correctamente');
});
