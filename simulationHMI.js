/* =========================================
   PURE PID LOGIC & CHART
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURACIÓN ---
    const DT = 0.1; // Paso de tiempo (segundos)
    
    // Estado del Sistema
    let system = {
        sp: 50,      // Setpoint (Objetivo)
        pv: 0,       // Process Variable (Nivel actual)
        cv: 0,       // Control Variable (Salida 0-100%)
        load: 0,     // Perturbación (Fuga)
        
        // PID Internals
        integral: 0,
        prevError: 0
    };

    // Parámetros PID (Valores iniciales)
    let tuning = { kp: 1.5, ki: 0.05, kd: 0.0 };

    // Historial para la gráfica (Array circular simple)
    const historyPoints = 200;
    let dataSP = new Array(historyPoints).fill(0);
    let dataPV = new Array(historyPoints).fill(0);

    // --- 2. REFERENCIAS DOM ---
    const els = {
        sliderSp: document.getElementById('slider-sp'),
        valSp: document.getElementById('val-sp'),
        
        sliderKp: document.getElementById('slider-kp'),
        valKp: document.getElementById('val-kp'),
        sliderKi: document.getElementById('slider-ki'),
        valKi: document.getElementById('val-ki'),
        sliderKd: document.getElementById('slider-kd'),
        valKd: document.getElementById('val-kd'),

        sliderLoad: document.getElementById('slider-load'),
        valLoad: document.getElementById('val-load'),

        dispCv: document.getElementById('disp-cv'),
        canvas: document.getElementById('pidChart'),
        btnReset: document.getElementById('btn-reset')
    };
    
    const ctx = els.canvas.getContext('2d');

    // --- 3. BUCLE PRINCIPAL (PHYSICS & CONTROL) ---
    setInterval(() => {
        // A. CÁLCULO PID
        const error = system.sp - system.pv;
        
        // Término Proporcional
        const P = tuning.kp * error;
        
        // Término Integral (Con Anti-Windup)
        // Solo acumulamos si no estamos saturados al 100% o 0%
        system.integral += error * DT;
        
        // Clamp de seguridad para la integral
        if(system.integral > 100) system.integral = 100;
        if(system.integral < -100) system.integral = -100;
        
        const I = tuning.ki * system.integral;

        // Término Derivativo
        const derivative = (error - system.prevError) / DT;
        const D = tuning.kd * derivative;

        system.prevError = error;

        // Salida PID Total
        let rawOutput = P + I + D;
        
        // Saturación (El actuador solo va de 0 a 100%)
        system.cv = Math.max(0, Math.min(100, rawOutput));


        // B. SIMULACIÓN FÍSICA (PROCESO DE PRIMER ORDEN)
        // Cambio de Nivel = (Entrada - Salida) * tiempo
        // Entrada = CV (Válvula)
        // Salida = Gravedad (depende del nivel) + Perturbación (Load)
        
        const inflow = system.cv * 0.5; // Factor de ganancia de entrada
        const outflow = (system.pv * 0.1) + system.load; // Gravedad + Fuga
        
        const dLevel = (inflow - outflow) * DT;
        system.pv += dLevel;

        // Límites físicos del tanque
        system.pv = Math.max(0, Math.min(100, system.pv));


        // C. VISUALIZACIÓN
        updateChart();
        els.dispCv.innerText = system.cv.toFixed(1) + '%';

    }, 50); // Correr cada 50ms


    // --- 4. FUNCIONES DE GRÁFICA ---
    function updateChart() {
        // Rotar arrays (Shift)
        dataSP.push(system.sp);
        dataSP.shift();
        dataPV.push(system.pv);
        dataPV.shift();

        // Limpiar Canvas
        const w = els.canvas.width;
        const h = els.canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Dibujar Setpoint (Verde)
        drawLine(dataSP, '#22c55e', 2);
        
        // Dibujar PV (Azul)
        drawLine(dataPV, '#3b82f6', 2);
    }

    function drawLine(data, color, width) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        
        const step = els.canvas.width / (data.length - 1);
        
        for(let i=0; i<data.length; i++) {
            // Escalar 0-100 a altura del canvas
            // (100 arriba, 0 abajo)
            const y = els.canvas.height - (data[i] / 100 * els.canvas.height);
            const x = i * step;
            
            if(i===0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }


    // --- 5. EVENT LISTENERS (INPUTS) ---
    // Función helper para conectar sliders
    function bindSlider(elem, valElem, targetObj, targetProp, isInt = false) {
        elem.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value);
            targetObj[targetProp] = val;
            valElem.innerText = isInt ? val : val.toFixed(1);
            if(targetProp === 'load') valElem.innerText += '%';
        });
    }

    bindSlider(els.sliderSp, els.valSp, system, 'sp', true);
    bindSlider(els.sliderKp, els.valKp, tuning, 'kp');
    bindSlider(els.sliderKi, els.valKi, tuning, 'ki'); // Aquí hay un error en el helper, Ki necesita 2 decimales
    bindSlider(els.sliderKd, els.valKd, tuning, 'kd');
    bindSlider(els.sliderLoad, els.valLoad, system, 'load');

    // Corrección manual para Ki (para ver 2 decimales)
    els.sliderKi.addEventListener('input', (e) => {
        tuning.ki = parseFloat(e.target.value);
        els.valKi.innerText = tuning.ki.toFixed(2);
    });

    els.btnReset.addEventListener('click', () => {
        system.pv = 0;
        system.integral = 0;
        system.prevError = 0;
        system.cv = 0;
        // Limpiar gráficas visualmente
        dataPV.fill(0);
    });

    // Ajuste inicial del tamaño del canvas (importante para que no se vea borroso)
    function resizeCanvas() {
        const parent = els.canvas.parentElement;
        els.canvas.width = parent.clientWidth;
        els.canvas.height = parent.clientHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Llamada inicial
});