from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app) 

# --- Objeto con los nombres para mostrar en el frontend ---
# Esto es para que el JS pueda construir los botones
LEY_NOMBRES = {
    # --- Identidad y Nulidad ---
    'identidad_or': 'Identidad (A+0=A)',
    'identidad_and': 'Identidad (A·1=A)',
    'anulacion_or': 'Elemento Nulo (A+1=1)',
    'anulacion_and': 'Elemento Nulo (A·0=0)',

    # --- Idempotencia, Involución, Complemento ---
    'idempotencia': 'Idempotencia (A+A=A, A·A=A)',
    'doble_negacion': 'Involución (A̅̅=A)',
    'complemento_or': 'Complemento (A+A̅=1)',
    'complemento_and': 'Complemento (A·A̅=0)',
    'complemento_or_grupo': 'Complemento (Grupo) (T+T̅=1)',
    'complemento_and_grupo': 'Complemento (Grupo) (T·T̅=0)',
    'complemento_or_termino': 'Complemento (Término) (ABC+(ABC)̅=1)',
    
    # --- Distributiva ---
    'distributiva_factor_1': 'Distributiva (Factor Común 1) (AB+AC = A(B+C))',
    'distributiva_factor_2': 'Distributiva (Factor Común 2) (AB+CB = B(A+C))',
    'distributiva_expandir': 'Distributiva (Expandir) (A(B+C) = AB+AC)',
    'distributiva_pos': 'Distributiva (POS) (A+BC = (A+B)(A+C))',

    # --- De Morgan ---
    'de_morgan_and_2': 'De Morgan (A·B)̅ = A̅+B̅',
    'de_morgan_and_3': 'De Morgan (A·B·C)̅ = A̅+B̅+C̅',
    'de_morgan_or_2': 'De Morgan (A+B)̅ = A̅·B̅',
    'de_morgan_or_3': 'De Morgan (A+B+C)̅ = A̅·B̅·C̅',
    
    # --- Teoremas Adicionales (de la imagen) ---
    'absorcion_1': 'Absorción (A + AB = A)',
    'absorcion_2': 'Absorción (A(A+B) = A)',
    'adjacencia_1': 'Adjacencia (AB + AB̅ = A)',
    'adjacencia_2': 'Adjacencia ((A+B)(A+B̅) = A)',
    'redundancia_1': 'Redundancia (A + A̅B = A+B)',
    'redundancia_2': 'Redundancia (A(A̅+B) = AB)',
    'consenso_1': 'Consenso (AB + A̅C + BC = AB + A̅C)',
    'consenso_2': 'Consenso ((A+B)(A̅+C)(B+C) = (A+B)(A̅+C))',
}

# Diccionario de leyes con el patrón REGEX y la sustitución
# Se reordenaron y agregaron las leyes de la imagen
LEY_REGISTRO = {
    
    # --- REGLAS DE DE MORGAN ---
    'de_morgan_and_3': (r'\(([A-Z])·([A-Z])·([A-Z])\)̅', r'\1̅+\2̅+\3̅'), # (A·B·C)̅ -> A̅+B̅+C̅
    'de_morgan_and_2': (r'\(([A-Z])·([A-Z])\)̅', r'\1̅+\2̅'),           # (A·B)̅ -> A̅+B̅
    'de_morgan_or_3': (r'\(([A-Z])\+([A-Z])\+([A-Z])\)̅', r'\1̅·\2̅·\3̅'), # (A+B+C)̅ -> A̅·B̅·C̅
    'de_morgan_or_2': (r'\(([A-Z])\+([A-Z])\)̅', r'\1̅·\2̅'),           # (A+B)̅ -> A̅·B̅

    # --- REGLAS DE COMPLEMENTO (Para Grupos y Términos) ---
    'complemento_or_grupo': (r'(\([A-Z·\+]+\))\+\1̅|\1̅\+(\([A-Z·\+]+\))', r'1'), # (T) + (T)̅ = 1
    'complemento_and_grupo': (r'(\([A-Z·\+]+\))·\1̅|\1̅·(\([A-Z·\+]+\))', r'0'), # (T) · (T)̅ = 0
    'complemento_or_termino': (r'([A-Z](?:·[A-Z])+)\+(\(\1\)̅)|\(\1\)̅\+\1', r'1'), # ABC + (ABC)̅ = 1

    # --- IDEMPOTENCIA, INVOLUCIÓN, COMPLEMENTO (Simples) ---
    'idempotencia': ('([A-Z])\+\\1|([A-Z])·\\1', r'\1\2'), 
    'doble_negacion': (r'([A-Z]̅)̅', r'\1'),
    'complemento_or': ('([A-Z])\+\\1̅|\1̅\+([A-Z])', r'1'),
    'complemento_and': ('([A-Z])·\\1̅|\1̅·([A-Z])', r'0'),

    # --- IDENTIDAD Y NULIDAD (Simples) ---
    'identidad_and': ('([A-Z])·1|1·([A-Z])', r'\1\2'),
    'identidad_or': ('([A-Z])\+0|0\+([A-Z])', r'\1\2'),
    'anulacion_or': ('([A-Z])\+1|1\+([A-Z])', r'1'),
    'anulacion_and': ('([A-Z])·0|0·([A-Z])', r'0'),

    # --- LEYES DISTRIBUTIVAS (Factorización y Expansión) ---
    # Nota: Se usan [A-Z̅]+ para capturar variables negadas o no negadas
    'distributiva_factor_1': (r'([A-Z̅])·([A-Z̅]+)\+\1·([A-Z̅]+)', r'\1·(\2+\3)'), # A·B + A·C = A(B+C)
    'distributiva_factor_2': (r'([A-Z̅]+)·([A-Z̅])\+([A-Z̅]+)·\2', r'(\1+\3)·\2'), # A·B + C·B = (A+C)B
    'distributiva_expandir': (r'([A-Z̅])·\(([A-Z̅]+)\+([A-Z̅]+)\)', r'\1·\2+\1·\3'), # A(B+C) = AB+AC
    'distributiva_pos': (r'([A-Z̅])\+\(([A-Z̅]+)·([A-Z̅]+)\)', r'(\1+\2)·(\1+\3)'), # A+(BC) = (A+B)(A+C)

    # --- TEOREMAS DE LA IMAGEN ---
    
    # Absorción (A + AB = A)
    'absorcion_1': (r'([A-Z̅])\+\1·[A-Z̅]|[A-Z̅]·\1\+\1', r'\1\2'), # A+AB=A | BA+A=A
    # Absorción (A(A+B) = A)
    'absorcion_2': (r'([A-Z̅])·\(\1\+[A-Z̅]\)|([A-Z̅])·\([A-Z̅]\+\1\)', r'\1\2'), # A(A+B)=A | A(B+A)=A

    # Adjacencia / Teorema 5 (AB + AB' = A)
    'adjacencia_1': (r'([A-Z̅]+)·([A-Z̅])\+\1·\2̅|([A-Z̅]+)·([A-Z̅])\+\2̅·\1', r'\1\3'), # TB + TB' = T | TB + B'T = T
    # Adjacencia / Teorema 5 ((A+B)(A+B') = A)
    'adjacencia_2': (r'\(([A-Z̅]+)\+([A-Z̅])\)·\(\1\+\2̅\)|\(([A-Z̅]+)\+([A-Z̅])\)·\(\2̅\+\1\)', r'\1\3'), # (T+B)(T+B')=T

    # Redundancia / Teorema 6 (A + A'B = A+B)
    'redundancia_1': (r'([A-Z̅])\+\1̅·([A-Z̅]+)|([A-Z̅]+)·\1̅\+\1', r'\1+\2\1+\3'), # A+A'B=A+B | BA'+A=A+B
    # Redundancia / Teorema 6 (A(A'+B) = AB)
    'redundancia_2': (r'([A-Z̅])·\(\1̅\+([A-Z̅]+)\)|(\1̅\+([A-Z̅]+))·\1', r'\1·\2\4·\1'), # A(A'+B)=AB | (A'+B)A=AB
    
    # Consenso
    # (AB + A'C + BC = AB + A'C)
    'consenso_1': (r'([A-Z̅])·([A-Z̅])\+\1̅·([A-Z̅])\+\2·\3|([A-Z̅])·([A-Z̅])\+\1̅·([A-Z̅])\+\3·\2', r'\1·\2+\1̅·\3\4·\5+\4̅·\6'),
    # ((A+B)(A'+C)(B+C) = (A+B)(A'+C))
    'consenso_2': (r'\(([A-Z̅])\+([A-Z̅])\)·\(\1̅\+([A-Z̅])\)·\(\2\+\3\)|\(([A-Z̅])\+([A-Z̅])\)·\(\1̅\+([A-Z̅])\)·\(\3\+\2\)', r'(\1+\2)·(\1̅+\3)(\4+\5)·(\4̅+\6)'),
}


def normalizar(expr):
    # Normaliza la expresión para que sea más fácil de procesar con regex
    norm = expr.upper().replace(' ', '')
    
    # Reemplaza ' por el caracter de negación (barra superior)
    # Importante: maneja (ABC)' convirtiéndolo a (ABC)̅
    norm = re.sub(r"\(([^)]+)\)'", r'(\1)̅', norm) # Grupo (ABC)' -> (ABC)̅
    norm = re.sub(r"([A-Z])'", r'\1̅', norm)      # Variable A' -> A̅
    
    # Añade '·' para AND implícito (yuxtaposición)
    # Ej: AB -> A·B, (A+B)C -> (A+B)·C
    # --- LÍNEA CORREGIDA ---
    # Se quitó '̅' del lookahead para evitar que (ABC)̅ se convierta en (ABC)·̅
    norm = re.sub(r'([A-Z\d̅)])(?=[A-Z\d(])', r'\1·', norm)
    
    # Limpieza de '·' duplicados o mal posiconados
    norm = norm.replace('··', '·')
    norm = norm.replace('·+', '+')
    norm = norm.replace('+·', '+')
    return norm

@app.route('/api/get-laws', methods=['GET'])
def get_laws():
    """
    DEPRECADO: Ya no se usa. El frontend pedirá leyes aplicables.
    """
    return jsonify(LEY_NOMBRES)

@app.route('/api/get-applicable-laws', methods=['POST'])
def get_applicable_laws():
    """
    Nuevo endpoint que recibe una expresión y devuelve
    SOLO las leyes que se pueden aplicar a ella.
    """
    data = request.json
    expresion_display = data.get('expression', '')
    if not expresion_display:
        return jsonify({}) # Devolver vacío si no hay expresión

    expresion_normalizada = normalizar(expresion_display)
    
    leyes_aplicables = {}
    
    # Iterar por todas las leyes y probar si su patrón (regex)
    # encuentra una coincidencia en la expresión.
    for key, (patron, _) in LEY_REGISTRO.items():
        if re.search(patron, expresion_normalizada):
            # Si hay coincidencia, es una ley aplicable
            leyes_aplicables[key] = LEY_NOMBRES[key]
    
    return jsonify(leyes_aplicables)


@app.route('/api/simplify', methods=['POST'])
def simplify_expression():
    data = request.json
    expresion_display = data.get('expression', '')
    ley_aplicar_key = data.get('law', '')
    
    if not ley_aplicar_key or not expresion_display:
        return jsonify({'error': 'Datos incompletos'}), 400

    expresion_normalizada = normalizar(expresion_display)
    
    expresion_resultante = expresion_normalizada
    law_applied_name = LEY_NOMBRES.get(ley_aplicar_key, ley_aplicar_key) # Obtener el nombre
    
    if ley_aplicar_key in LEY_REGISTRO:
        patron, sustitucion = LEY_REGISTRO[ley_aplicar_key]
        
        # Bucle 'while' para aplicar la ley tantas veces como sea posible
        # Ej: A+A+A -> A+A -> A
        temp_expr = re.sub(patron, sustitucion, expresion_resultante)
        while temp_expr != expresion_resultante:
            expresion_resultante = temp_expr
            temp_expr = re.sub(patron, sustitucion, expresion_resultante)
            
    else:
        return jsonify({'error': 'Ley no implementada o no válida'}), 400

    # De-normalizar para mostrar al usuario (convertir ̅ a ' y quitar ·)
    expresion_final_display = expresion_resultante.replace("̅", "'").replace("·", "")

    return jsonify({
        'original_normalized': expresion_normalizada,
        'simplified_expression_normalized': expresion_resultante,
        'simplified_expression_display': expresion_final_display,
        'law_applied': ley_aplicar_key,
        'law_applied_name': law_applied_name # Enviar el nombre bonito al frontend
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
