// JavaScript para la calculadora de resta binaria
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const minuendBinary = document.getElementById('minuendBinary');
    const subtrahendBinary = document.getElementById('subtrahendBinary');
    const calculateSubtraction = document.getElementById('calculateSubtraction');
    const validationMinuend = document.getElementById('validationMinuend');
    const validationSubtrahend = document.getElementById('validationSubtrahend');
    const operationDisplay = document.getElementById('operationDisplay');
    const displayMinuend = document.getElementById('displayMinuend');
    const displaySubtrahend = document.getElementById('displaySubtrahend');
    const displayResult = document.getElementById('displayResult');
    const decimalResult = document.getElementById('decimalResult');
    const decimalValue = document.getElementById('decimalValue');
    const stepExplanation = document.getElementById('stepExplanation');
    const visualProcess = document.getElementById('visualProcess');
    const stepTable = document.getElementById('stepTable');
    const methodTabs = document.querySelectorAll('.method-tab');

    let currentMethod = 'direct';

    // Validación en tiempo real
    minuendBinary.addEventListener('input', function() {
        validateBinaryInput(this, validationMinuend);
    });

    subtrahendBinary.addEventListener('input', function() {
        validateBinaryInput(this, validationSubtrahend);
    });

    // Calcular resta al hacer clic
    calculateSubtraction.addEventListener('click', function() {
        performBinarySubtraction();
    });

    // Calcular resta al presionar Enter
    minuendBinary.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performBinarySubtraction();
    });

    subtrahendBinary.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performBinarySubtraction();
    });

    // Manejo de pestañas de métodos
    methodTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            methodTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentMethod = this.getAttribute('data-method');
            
            // Recalcular si hay datos
            if (minuendBinary.value && subtrahendBinary.value) {
                performBinarySubtraction();
            }
        });
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

    // Función principal para realizar la resta binaria
    function performBinarySubtraction() {
        const minuend = minuendBinary.value.trim();
        const subtrahend = subtrahendBinary.value.trim();

        // Validar ambos números
        const validMinuend = validateBinaryInput(minuendBinary, validationMinuend);
        const validSubtrahend = validateBinaryInput(subtrahendBinary, validationSubtrahend);

        if (!validMinuend || !validSubtrahend || !minuend || !subtrahend) {
            alert('Por favor ingresa dos números binarios válidos');
            return;
        }

        // Verificar que el minuendo sea mayor o igual al sustraendo
        const decMinuend = parseInt(minuend, 2);
        const decSubtrahend = parseInt(subtrahend, 2);

        if (decMinuend < decSubtrahend) {
            alert('El primer número debe ser mayor o igual al segundo para esta calculadora');
            return;
        }

        // Realizar la resta según el método seleccionado
        let result;
        if (currentMethod === 'direct') {
            result = subtractBinaryDirect(minuend, subtrahend);
        } else {
            result = subtractBinaryComplement(minuend, subtrahend);
        }
        
        // Mostrar resultados
        displayResults(minuend, subtrahend, result);
        
        // Mostrar proceso paso a paso
        showStepByStep(minuend, subtrahend, result);
    }

    // Función para resta binaria directa
    function subtractBinaryDirect(minuend, subtrahend) {
        // Igualar la longitud de ambos números
        const maxLength = Math.max(minuend.length, subtrahend.length);
        const num1 = minuend.padStart(maxLength, '0');
        const num2 = subtrahend.padStart(maxLength, '0');
        
        let result = '';
        let borrow = 0;
        const steps = [];

        // Restar de derecha a izquierda
        for (let i = maxLength - 1; i >= 0; i--) {
            let digit1 = parseInt(num1[i]);
            const digit2 = parseInt(num2[i]);
            
            // Aplicar préstamo anterior
            digit1 -= borrow;
            borrow = 0;

            let difference;
            let needBorrow = false;

            if (digit1 >= digit2) {
                difference = digit1 - digit2;
            } else {
                // Necesitamos pedir prestado
                difference = (digit1 + 2) - digit2;
                borrow = 1;
                needBorrow = true;
            }

            result = difference + result;

            // Guardar paso para explicación
            steps.push({
                position: maxLength - 1 - i,
                minuendDigit: parseInt(num1[i]),
                subtrahendDigit: digit2,
                borrowIn: i < maxLength - 1 ? steps[steps.length - 1]?.borrowOut || 0 : 0,
                difference: difference,
                borrowOut: borrow,
                needBorrow: needBorrow,
                adjustedMinuend: digit1 + (needBorrow ? 2 : 0)
            });
        }

        // Eliminar ceros a la izquierda
        result = result.replace(/^0+/, '') || '0';

        return {
            binary: result,
            steps: steps,
            minuendPadded: num1,
            subtrahendPadded: num2,
            method: 'direct'
        };
    }

    // Función para resta usando complemento a 2
    function subtractBinaryComplement(minuend, subtrahend) {
        // Convertir la resta a suma usando complemento a 2
        const complement = getTwosComplement(subtrahend);
        
        // Igualar longitudes
        const maxLength = Math.max(minuend.length, complement.length) + 1; // +1 para overflow
        const num1 = minuend.padStart(maxLength, '0');
        const comp = complement.padStart(maxLength, '0');
        
        // Sumar minuendo + complemento
        let result = '';
        let carry = 0;
        const steps = [];

        for (let i = maxLength - 1; i >= 0; i--) {
            const digit1 = parseInt(num1[i]);
            const digit2 = parseInt(comp[i]);
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

        // Eliminar el bit de overflow y ceros a la izquierda
        result = result.substring(1).replace(/^0+/, '') || '0';

        return {
            binary: result,
            steps: steps,
            minuendPadded: num1,
            complementPadded: comp,
            originalSubtrahend: subtrahend,
            complement: complement,
            method: 'complement'
        };
    }

    // Función para obtener el complemento a 2
    function getTwosComplement(binary) {
        // Paso 1: Complemento a 1 (invertir bits)
        let onesComplement = '';
        for (let i = 0; i < binary.length; i++) {
            onesComplement += binary[i] === '0' ? '1' : '0';
        }

        // Paso 2: Sumar 1 al complemento a 1
        let result = '';
        let carry = 1; // Empezamos con carry 1 para sumar 1

        for (let i = onesComplement.length - 1; i >= 0; i--) {
            const digit = parseInt(onesComplement[i]);
            const sum = digit + carry;

            if (sum === 0) {
                result = '0' + result;
                carry = 0;
            } else if (sum === 1) {
                result = '1' + result;
                carry = 0;
            } else if (sum === 2) {
                result = '0' + result;
                carry = 1;
            }
        }

        return result;
    }

    // Mostrar resultados
    function displayResults(minuend, subtrahend, result) {
        displayMinuend.textContent = minuend;
        displaySubtrahend.textContent = subtrahend;
        displayResult.textContent = result.binary;
        
        operationDisplay.style.display = 'grid';

        // Mostrar equivalencia decimal
        const decMinuend = parseInt(minuend, 2);
        const decSubtrahend = parseInt(subtrahend, 2);
        const decResult = parseInt(result.binary, 2);
        
        decimalValue.textContent = `${decMinuend} - ${decSubtrahend} = ${decResult}`;
        decimalResult.style.display = 'block';
    }

    // Mostrar explicación paso a paso
    function showStepByStep(minuend, subtrahend, result) {
        if (result.method === 'direct') {
            createDirectSubtractionProcess(result);
        } else {
            createComplementSubtractionProcess(result);
        }
        
        stepExplanation.classList.add('show');
    }

    // Crear proceso visual para resta directa
    function createDirectSubtractionProcess(result) {
        const maxLength = result.minuendPadded.length;
        
        let html = '<div class="visual-subtraction">';
        
        // Encabezado de posiciones
        html += '<div class="addition-row">';
        html += '<span class="position-cell">Posición:</span>';
        for (let i = maxLength - 1; i >= 0; i--) {
            html += `<span class="position-cell">${i}</span>`;
        }
        html += '</div>';

        // Minuendo
        html += '<div class="addition-row">';
        html += '<span></span>';
        for (let i = 0; i < maxLength; i++) {
            html += `<span class="addition-number">${result.minuendPadded[i]}</span>`;
        }
        html += '</div>';

        // Sustraendo
        html += '<div class="addition-row">';
        html += '<span>-</span>';
        for (let i = 0; i < maxLength; i++) {
            html += `<span class="addition-number">${result.subtrahendPadded[i]}</span>`;
        }
        html += '</div>';

        // Línea separadora
        html += '<div class="addition-line"></div>';

        // Préstamos
        html += '<div class="addition-row">';
        html += '<span>Préstamo:</span>';
        for (let i = 0; i < maxLength; i++) {
            const step = result.steps.find(s => s.position === maxLength - 1 - i);
            const borrowOut = step ? step.borrowOut : 0;
            html += `<span class="subtraction-borrow">${borrowOut}</span>`;
        }
        html += '</div>';

        // Resultado
        html += '<div class="addition-row">';
        html += '<span>Resultado:</span>';
        const resultPadded = result.binary.padStart(maxLength, '0');
        for (let i = 0; i < maxLength; i++) {
            html += `<span class="addition-result">${resultPadded[i]}</span>`;
        }
        html += '</div>';

        html += '</div>';
        
        // Crear tabla de pasos para resta directa
        html += '<table class="step-table">';
        html += '<thead><tr>';
        html += '<th>Posición</th>';
        html += '<th>Minuendo</th>';
        html += '<th>Sustraendo</th>';
        html += '<th>Préstamo</th>';
        html += '<th>Operación</th>';
        html += '<th>Resultado</th>';
        html += '<th>Explicación</th>';
        html += '</tr></thead><tbody>';

        for (let i = result.steps.length - 1; i >= 0; i--) {
            const step = result.steps[i];
            html += '<tr>';
            html += `<td class="position-cell">${step.position}</td>`;
            html += `<td>${step.minuendDigit}</td>`;
            html += `<td>${step.subtrahendDigit}</td>`;
            html += `<td class="carry-cell">${step.borrowOut}</td>`;
            html += `<td>${step.adjustedMinuend} - ${step.subtrahendDigit}</td>`;
            html += `<td class="result-cell">${step.difference}</td>`;
            html += `<td>${getDirectStepExplanation(step)}</td>`;
            html += '</tr>';
        }

        html += '</tbody></table>';
        
        visualProcess.innerHTML = html;
        stepTable.innerHTML = '';
    }

    // Crear proceso visual para complemento a 2
    function createComplementSubtractionProcess(result) {
        let html = '<div class="visual-subtraction">';
        
        html += '<h5>Paso 1: Obtener complemento a 2 del sustraendo</h5>';
        html += `<p><strong>Número original:</strong> ${result.originalSubtrahend}</p>`;
        html += `<p><strong>Complemento a 1:</strong> ${getOnesComplement(result.originalSubtrahend)}</p>`;
        html += `<p><strong>Complemento a 2:</strong> ${result.complement}</p>`;
        
        html += '<h5>Paso 2: Sumar minuendo + complemento a 2</h5>';
        
        const maxLength = result.minuendPadded.length;
        
        // Mostrar la suma
        html += '<div class="addition-row">';
        html += '<span></span>';
        for (let i = 0; i < maxLength; i++) {
            html += `<span class="addition-number">${result.minuendPadded[i]}</span>`;
        }
        html += '</div>';

        html += '<div class="addition-row">';
        html += '<span>+</span>';
        for (let i = 0; i < maxLength; i++) {
            html += `<span class="addition-number">${result.complementPadded[i]}</span>`;
        }
        html += '</div>';

        html += '<div class="addition-line"></div>';

        html += '<div class="addition-row">';
        html += '<span>Resultado:</span>';
        const tempResult = result.binary.padStart(maxLength, '0');
        for (let i = 0; i < maxLength; i++) {
            html += `<span class="addition-result">${tempResult[i]}</span>`;
        }
        html += '</div>';

        html += '<p><strong>Nota:</strong> Se descarta el bit de overflow para obtener el resultado final.</p>';
        
        html += '</div>';
        
        visualProcess.innerHTML = html;
        stepTable.innerHTML = '';
    }

    // Función auxiliar para obtener complemento a 1
    function getOnesComplement(binary) {
        let result = '';
        for (let i = 0; i < binary.length; i++) {
            result += binary[i] === '0' ? '1' : '0';
        }
        return result;
    }

    // Generar explicación para resta directa
    function getDirectStepExplanation(step) {
        if (step.needBorrow) {
            return `${step.minuendDigit} < ${step.subtrahendDigit}, pido préstamo: ${step.adjustedMinuend} - ${step.subtrahendDigit} = ${step.difference}`;
        } else {
            return `${step.minuendDigit} - ${step.subtrahendDigit} = ${step.difference}`;
        }
    }

    console.log('Calculadora de resta binaria inicializada correctamente');
});
