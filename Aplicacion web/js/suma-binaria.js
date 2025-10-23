// JavaScript para la calculadora de suma binaria
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const binaryNumber1 = document.getElementById('binaryNumber1');
    const binaryNumber2 = document.getElementById('binaryNumber2');
    const calculateSum = document.getElementById('calculateSum');
    const validation1 = document.getElementById('validation1');
    const validation2 = document.getElementById('validation2');
    const operationDisplay = document.getElementById('operationDisplay');
    const displayNumber1 = document.getElementById('displayNumber1');
    const displayNumber2 = document.getElementById('displayNumber2');
    const displayResult = document.getElementById('displayResult');
    const decimalResult = document.getElementById('decimalResult');
    const decimalValue = document.getElementById('decimalValue');
    const stepExplanation = document.getElementById('stepExplanation');
    const visualProcess = document.getElementById('visualProcess');
    const stepTable = document.getElementById('stepTable');

    // Validación en tiempo real
    binaryNumber1.addEventListener('input', function() {
        validateBinaryInput(this, validation1);
    });

    binaryNumber2.addEventListener('input', function() {
        validateBinaryInput(this, validation2);
    });

    // Calcular suma al hacer clic
    calculateSum.addEventListener('click', function() {
        performBinaryAddition();
    });

    // Calcular suma al presionar Enter
    binaryNumber1.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performBinaryAddition();
    });

    binaryNumber2.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performBinaryAddition();
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

        if (value.length > 16) {
            showValidation(validationElement, 'Máximo 16 dígitos', 'error');
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

    // Función principal para realizar la suma binaria
    function performBinaryAddition() {
        const num1 = binaryNumber1.value.trim();
        const num2 = binaryNumber2.value.trim();

        // Validar ambos números
        const valid1 = validateBinaryInput(binaryNumber1, validation1);
        const valid2 = validateBinaryInput(binaryNumber2, validation2);

        if (!valid1 || !valid2 || !num1 || !num2) {
            alert('Por favor ingresa dos números binarios válidos');
            return;
        }

        // Realizar la suma
        const result = addBinaryNumbers(num1, num2);
        
        // Mostrar resultados
        displayResults(num1, num2, result);
        
        // Mostrar proceso paso a paso
        showStepByStep(num1, num2, result);
    }

    // Función para sumar números binarios
    function addBinaryNumbers(bin1, bin2) {
        // Igualar la longitud de ambos números agregando ceros a la izquierda
        const maxLength = Math.max(bin1.length, bin2.length);
        const num1 = bin1.padStart(maxLength, '0');
        const num2 = bin2.padStart(maxLength, '0');
        
        let result = '';
        let carry = 0;
        const steps = [];

        // Sumar de derecha a izquierda
        for (let i = maxLength - 1; i >= 0; i--) {
            const digit1 = parseInt(num1[i]);
            const digit2 = parseInt(num2[i]);
            const sum = digit1 + digit2 + carry;

            if (sum === 0) {
                result = '0' + result;
                carry = 0;
            } else if (sum === 1) {
                result = '1' + result;
                carry = 0;
            } else if (sum === 2) {
                result = '0' + result;
                carry = 1;
            } else if (sum === 3) {
                result = '1' + result;
                carry = 1;
            }

            // Guardar paso para explicación
            steps.push({
                position: maxLength - 1 - i,
                digit1: digit1,
                digit2: digit2,
                carryIn: carry,
                sum: sum,
                result: sum % 2,
                carryOut: Math.floor(sum / 2)
            });
        }

        // Si queda un acarreo final
        if (carry > 0) {
            result = '1' + result;
        }

        return {
            binary: result,
            steps: steps,
            num1Padded: num1,
            num2Padded: num2,
            finalCarry: carry
        };
    }

    // Mostrar resultados
    function displayResults(num1, num2, result) {
        displayNumber1.textContent = num1;
        displayNumber2.textContent = num2;
        displayResult.textContent = result.binary;
        
        operationDisplay.style.display = 'grid';

        // Mostrar equivalencia decimal
        const decimal1 = parseInt(num1, 2);
        const decimal2 = parseInt(num2, 2);
        const decimalResultValue = parseInt(result.binary, 2);
        
        decimalValue.textContent = `${decimal1} + ${decimal2} = ${decimalResultValue}`;
        decimalResult.style.display = 'block';
    }

    // Mostrar explicación paso a paso
    function showStepByStep(num1, num2, result) {
        // Crear visualización paso a paso
        createVisualProcess(result);
        
        // Crear tabla de pasos
        createStepTable(result);
        
        stepExplanation.classList.add('show');
    }

    // Crear proceso visual
    function createVisualProcess(result) {
        const maxLength = Math.max(result.num1Padded.length, result.num2Padded.length);
        
        let html = '<div class="visual-addition">';
        
        // Encabezado de posiciones
        html += '<div class="addition-row">';
        html += '<span class="position-cell">Posición:</span>';
        for (let i = maxLength - 1; i >= 0; i--) {
            html += `<span class="position-cell">${i}</span>`;
        }
        html += '</div>';

        // Primer número
        html += '<div class="addition-row">';
        html += '<span></span>';
        for (let i = 0; i < maxLength; i++) {
            html += `<span class="addition-number">${result.num1Padded[i]}</span>`;
        }
        html += '</div>';

        // Segundo número
        html += '<div class="addition-row">';
        html += '<span>+</span>';
        for (let i = 0; i < maxLength; i++) {
            html += `<span class="addition-number">${result.num2Padded[i]}</span>`;
        }
        html += '</div>';

        // Línea separadora
        html += '<div class="addition-line"></div>';

        // Acarreos
        html += '<div class="addition-row">';
        html += '<span>Acarreo:</span>';
        for (let i = 0; i < maxLength; i++) {
            const step = result.steps.find(s => s.position === maxLength - 1 - i);
            const carryOut = step ? step.carryOut : 0;
            html += `<span class="addition-carry">${carryOut}</span>`;
        }
        html += '</div>';

        // Resultado
        html += '<div class="addition-row">';
        html += '<span>Resultado:</span>';
        for (let i = 0; i < result.binary.length; i++) {
            html += `<span class="addition-result">${result.binary[i]}</span>`;
        }
        html += '</div>';

        html += '</div>';
        
        visualProcess.innerHTML = html;
    }

    // Crear tabla de pasos
    function createStepTable(result) {
        let html = '<table class="step-table">';
        html += '<thead><tr>';
        html += '<th>Posición</th>';
        html += '<th>Dígito 1</th>';
        html += '<th>Dígito 2</th>';
        html += '<th>Acarreo Entrada</th>';
        html += '<th>Suma</th>';
        html += '<th>Resultado</th>';
        html += '<th>Acarreo Salida</th>';
        html += '<th>Explicación</th>';
        html += '</tr></thead><tbody>';

        for (let i = result.steps.length - 1; i >= 0; i--) {
            const step = result.steps[i];
            html += '<tr>';
            html += `<td class="position-cell">${step.position}</td>`;
            html += `<td>${step.digit1}</td>`;
            html += `<td>${step.digit2}</td>`;
            html += `<td class="carry-cell">${i > 0 ? result.steps[i-1].carryOut : 0}</td>`;
            html += `<td>${step.sum}</td>`;
            html += `<td class="result-cell">${step.result}</td>`;
            html += `<td class="carry-cell">${step.carryOut}</td>`;
            html += `<td>${getStepExplanation(step, i > 0 ? result.steps[i-1].carryOut : 0)}</td>`;
            html += '</tr>';
        }

        if (result.finalCarry > 0) {
            html += '<tr>';
            html += `<td class="position-cell">${result.steps.length}</td>`;
            html += '<td>0</td>';
            html += '<td>0</td>';
            html += `<td class="carry-cell">${result.finalCarry}</td>`;
            html += `<td>${result.finalCarry}</td>`;
            html += `<td class="result-cell">${result.finalCarry}</td>`;
            html += '<td class="carry-cell">0</td>';
            html += '<td>Acarreo final</td>';
            html += '</tr>';
        }

        html += '</tbody></table>';
        
        stepTable.innerHTML = html;
    }

    // Generar explicación para cada paso
    function getStepExplanation(step, carryIn) {
        const total = step.digit1 + step.digit2 + carryIn;
        
        if (total === 0) {
            return '0 + 0 = 0';
        } else if (total === 1) {
            if (carryIn === 1) {
                return `${step.digit1} + ${step.digit2} + 1(acarreo) = 1`;
            } else {
                return `${step.digit1} + ${step.digit2} = 1`;
            }
        } else if (total === 2) {
            if (carryIn === 1) {
                return `${step.digit1} + ${step.digit2} + 1(acarreo) = 10 → 0, llevo 1`;
            } else {
                return `${step.digit1} + ${step.digit2} = 10 → 0, llevo 1`;
            }
        } else if (total === 3) {
            return `${step.digit1} + ${step.digit2} + 1(acarreo) = 11 → 1, llevo 1`;
        }
        
        return `Suma: ${total}`;
    }

    // Función para convertir binario a decimal
    function binaryToDecimal(binary) {
        return parseInt(binary, 2);
    }

    console.log('Calculadora de suma binaria inicializada correctamente');
});
