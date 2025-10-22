document.addEventListener('DOMContentLoaded', () => {

    // --- Referencias a elementos del DOM ---
    const exprInput = document.getElementById('expr');
    const confirmBtn = document.getElementById('confirmar-expr');
    const exprActualSpan = document.getElementById('expr-actual');
    const leyesContainer = document.getElementById('leyes-botones-container');
    const historialList = document.getElementById('historial');
    const undoBtn = document.getElementById('undo-btn');

    // --- Estado de la aplicación ---
    let estadoActual = {
        expresion: "---", // La expresión en formato 'Display' (ej: AB')
    };
    let historial = []; // Pila para el historial de 'undo'

    // --- API URL ---
    const API_URL = 'http://127.0.0.1:5000';

    // --- Listeners de eventos ---
    confirmBtn.addEventListener('click', iniciarSimplificacion);
    undoBtn.addEventListener('click', deshacerPaso);
    
    // --- Inicialización ---
    inicializarUI();

    /**
     * Configura la UI inicial
     */
    function inicializarUI() {
        leyesContainer.innerHTML = '<p>Ingresa una expresión y presiona Iniciar/Actualizar.</p>';
        undoBtn.disabled = true;

        // Lógica de Menú Móvil (si existe)
        const mobileMenu = document.getElementById('mobile-menu');
        const navbarMenu = document.querySelector('.navbar-menu');
        if (mobileMenu) {
            mobileMenu.addEventListener('click', () => {
                navbarMenu.classList.toggle('active');
            });
        }
    }

    /**
     * Carga SÓLO las leyes aplicables a la expresión dada.
     */
    async function cargarLeyesAplicables(expresion) {
        leyesContainer.innerHTML = '<p>Buscando leyes aplicables...</p>';
        try {
            const response = await fetch(`${API_URL}/api/get-applicable-laws`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expression: expresion })
            });

            if (!response.ok) {
                throw new Error('No se pudo conectar al backend (revisa que esté corriendo).');
            }
            const leyesAplicables = await response.json();
            // Una vez cargadas, generar los botones
            generarBotonesDeLeyes(leyesAplicables); 
        } catch (error) {
            leyesContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }

    /**
     * Se llama al presionar "Iniciar/Actualizar".
     * Resetea el estado y muestra la nueva expresión.
     */
    async function iniciarSimplificacion() {
        const exprTexto = exprInput.value;
        if (!exprTexto.trim()) {
            mostrarAlerta("Por favor, ingresa una expresión.");
            return;
        }
        
        // Limpiar historial
        historial = [];
        const exprLimpia = exprTexto.replace(/\s+/g, '');
        actualizarUI(exprLimpia, "Inicio"); // Actualiza el estado y la UI
        
        exprInput.value = ''; // Limpiar input
        
        // Cargar leyes aplicables para esta expresión
        await cargarLeyesAplicables(exprLimpia);
    }

    /**
     * Recibe la lista FILTRADA de leyes y crea los botones.
     */
    function generarBotonesDeLeyes(leyesAplicables) {
        leyesContainer.innerHTML = ''; // Limpiar
        
        if (estadoActual.expresion === "---") {
             leyesContainer.innerHTML = '<p>Ingresa una expresión y presiona Iniciar/Actualizar.</p>';
             return;
        }

        const keys = Object.keys(leyesAplicables);

        if (keys.length === 0) {
            leyesContainer.innerHTML = '<p>No se encontraron leyes aplicables. La expresión puede estar simplificada.</p>';
            return;
        }

        // Crear un botón para CADA ley APLICABLE
        for (const [key, nombre] of Object.entries(leyesAplicables)) {
            const btn = document.createElement('button');
            btn.className = 'ley-btn'; // Puedes estilizar esta clase en tu CSS
            btn.textContent = nombre;
            btn.dataset.leyKey = key; // Guardar la 'key' de la ley
            
            // Asignar evento
            btn.addEventListener('click', () => aplicarLey(key));
            
            leyesContainer.appendChild(btn);
        }
    }

    /**
     * Se llama al hacer clic en un botón de ley.
     * Envía la expresión actual y la ley al backend.
     */
    async function aplicarLey(leyKey) {
        try {
            const response = await fetch(`${API_URL}/api/simplify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    expression: estadoActual.expresion, // Enviar la expresión 'Display'
                    law: leyKey
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error desconocido del servidor');
            }

            const data = await response.json();

            // Comprobar si la ley realmente cambió la expresión
            if (data.original_normalized === data.simplified_expression_normalized) {
                // Esta es la alerta que viste
                mostrarAlerta(`La ley "${data.law_applied_name}" no modificó la expresión.`);
            } else {
                // Si cambió, guardar el estado anterior en el historial
                historial.push({ ...estadoActual }); 
                // Actualizar la UI con la nueva expresión
                actualizarUI(data.simplified_expression_display, data.law_applied_name);
                
                // Cargar las leyes aplicables para la NUEVA expresión
                await cargarLeyesAplicables(data.simplified_expression_display);
            }

        } catch (error) {
            mostrarAlerta(`Error: ${error.message}`);
        }
    }

    /**
     * Revierte al estado anterior guardado en el historial.
     */
    async function deshacerPaso() {
        if (historial.length > 0) {
            const estadoAnterior = historial.pop();
            const leyDeshecha = estadoActual.leyAplicada; // La ley que estamos deshaciendo
            
            // Restaurar estado
            actualizarUI(estadoAnterior.expresion, `Deshacer "${leyDeshecha}"`);

            // Quitar el último item del historial en la UI
            if (historialList.lastChild) {
                historialList.removeChild(historialList.lastChild); // Quita el paso que se deshizo
                if (historialList.lastChild) {
                     historialList.lastChild.classList.add('current-step'); // Marca el nuevo último
                }
            }
            
            // Cargar las leyes para el estado restaurado
            await cargarLeyesAplicables(estadoActual.expresion); 
        }
    }

    /**
     * Función central para actualizar el estado y la UI.
     * @param {string} nuevaExpresion - La nueva expresión en formato 'Display'.
     * @param {string} nombreLeyAplicada - El nombre de la ley (ej: 'De Morgan...')
     */
    function actualizarUI(nuevaExpresion, nombreLeyAplicada) {
        // 1. Actualizar el estado global
        estadoActual.expresion = nuevaExpresion;
        estadoActual.leyAplicada = nombreLeyAplicada;
        
        // 2. Actualizar el <span> de la expresión actual
        exprActualSpan.textContent = nuevaExpresion;
        
        // 3. Quitar la clase 'current' de todos los items
         historialList.querySelectorAll('li').forEach(li => li.classList.remove('current-step'));

        // 4. Añadir al historial visual
        const li = document.createElement('li');
        li.classList.add('current-step'); // Marcar como el paso actual

        if (nombreLeyAplicada === "Inicio") {
            historialList.innerHTML = ''; // Limpiar historial si es el inicio
            li.innerHTML = `Expresión Inicial: <span>${nuevaExpresion}</span>`;
        } else if (nombreLeyAplicada.startsWith("Deshacer")) {
             li.innerHTML = `<span style="color: #888;">${nombreLeyAplicada}</span> ➔ <span>${nuevaExpresion}</span>`;
        } 
        else {
            li.innerHTML = `<b>${nombreLeyAplicada}</b> ➔ <span>${nuevaExpresion}</span>`;
        }
        historialList.appendChild(li);
        
        // 5. Habilitar/Deshabilitar botón de deshacer
        undoBtn.disabled = historial.length === 0;
    }

    /**
     * Muestra una alerta simple (reemplaza alert()).
     */
    function mostrarAlerta(mensaje) {
        // (Podrías reemplazar esto con un modal más bonito)
        alert(mensaje); 
    }
});
