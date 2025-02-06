import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Generar ecuaciones con solución entera
function generarEcuacion() {
  let a, b, c, solucion;
  do {
    a = Math.floor(Math.random() * 8) + 2; // Ajusta este rango para mayor dificultad
    b = Math.floor(Math.random() * 21) - 10;
    c = Math.floor(Math.random() * 21) - 10;
    solucion = c - b;
  } while (solucion % a !== 0);

  solucion = solucion / a;
  return { ecuacion: `${a}x + ${b} = ${c}`, solucion };
}

export default function DefensoresDelAlgebra() {
  const [enemigos, setEnemigos] = useState([]);
  const [ecuacionActiva, setEcuacionActiva] = useState(null);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [puntuacion, setPuntuacion] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [oleada, setOleada] = useState(1);
  const [finDelJuego, setFinDelJuego] = useState(false);
  const [retroalimentacion, setRetroalimentacion] = useState('');
  const [mostrarMensaje, setMostrarMensaje] = useState(false);

  // Nueva sección: almacenar y mostrar la mejor puntuación
  const [bestScore, setBestScore] = useState(0);

  // Referencia al intervalo de movimiento
  const intervaloMovimientoRef = useRef(null);

  useEffect(() => {
    // Carga la mejor puntuación (si existe) al iniciar
    const storedBestScore = localStorage.getItem('bestScore');
    if (storedBestScore) {
      setBestScore(parseInt(storedBestScore, 10));
    }
  }, []);

  // Función para crear un nuevo enemigo con posición horizontal aleatoria
  function crearEnemigo() {
    const { ecuacion, solucion } = generarEcuacion();
    const posX = Math.floor(Math.random() * 70) + 15; 
    // Ajusta 70 y 15 para que no se salga demasiado de los bordes
    return { 
      id: Date.now().toString(), 
      ecuacion, 
      solucion, 
      posicionY: 0, // Se renombra a posicionY para mayor claridad
      posX 
    };
  }

  // Efecto que inicia una nueva oleada con un único enemigo (puedes multiplicar si quieres varios)
  useEffect(() => {
    const nuevoEnemigo = crearEnemigo();
    setEnemigos([nuevoEnemigo]);
    setEcuacionActiva(nuevoEnemigo);
  }, [oleada]);

  // Movimiento automático de los enemigos
  useEffect(() => {
    if (finDelJuego) return;

    // Limpia el intervalo anterior, si existe
    if (intervaloMovimientoRef.current) {
      clearInterval(intervaloMovimientoRef.current);
    }

    // Configura un nuevo intervalo de movimiento
    intervaloMovimientoRef.current = setInterval(() => {
      setEnemigos((prev) =>
        prev.map((enemigo) => ({
          ...enemigo,
          posicionY: enemigo.posicionY + 10 // Aumenta para que caiga más rápido si deseas
        }))
      );
    }, 1000);

    // Limpia el intervalo al desmontar o al reiniciarse el efecto
    return () => clearInterval(intervaloMovimientoRef.current);
  }, [finDelJuego]);

  // Verificar si un enemigo llegó al fondo
  useEffect(() => {
    setEnemigos((prev) =>
      prev.filter((enemigo) => {
        if (enemigo.posicionY < 400) {
          return true;
        } else {
          perderVida();
          mostrarMensajeDeRetroalimentacion(
            `❌ ¡Oh no! El enemigo llegó al fondo. La respuesta correcta era: ${enemigo.solucion}`
          );
          return false;
        }
      })
    );
  }, [enemigos]);

  function perderVida() {
    setVidas((prev) => {
      const nuevasVidas = prev - 1;
      if (nuevasVidas <= 0) {
        setFinDelJuego(true);
      }
      return nuevasVidas;
    });
  }

  // Manejo de la respuesta del usuario
  function manejarRespuesta() {
    if (!ecuacionActiva) return;
    const numero = parseInt(respuestaUsuario, 10);
    if (Number.isNaN(numero)) return;

    if (numero === ecuacionActiva.solucion) {
      setPuntuacion((prev) => prev + 10);
      mostrarMensajeDeRetroalimentacion(
        `✅ ¡Correcto! La respuesta es ${ecuacionActiva.solucion}`
      );
    } else {
      perderVida();
      mostrarMensajeDeRetroalimentacion(
        `❌ ¡Incorrecto! La respuesta correcta era: ${ecuacionActiva.solucion}`
      );
    }

    setRespuestaUsuario('');
  }

  // Función para mostrar mensaje (retroalimentación) y pasar a la siguiente oleada
  function mostrarMensajeDeRetroalimentacion(msj) {
    setRetroalimentacion(msj);
    setMostrarMensaje(true);

    setTimeout(() => {
      setMostrarMensaje(false);
      if (!finDelJuego && vidas > 0) {
        setOleada((prev) => prev + 1);
      }
    }, 3000);
  }

  // Reiniciar juego
  function reiniciarJuego() {
    // Actualiza la mejor puntuación si la actual es mayor
    if (puntuacion > bestScore) {
      setBestScore(puntuacion);
      localStorage.setItem('bestScore', puntuacion.toString());
    }
    setPuntuacion(0);
    setVidas(3);
    setOleada(1);
    setFinDelJuego(false);
    setEcuacionActiva(null);
    setEnemigos([]);
  }

  // Pantalla de fin de juego
  if (finDelJuego) {
    // Actualiza bestScore al final del juego si corresponde
    if (puntuacion > bestScore) {
      setBestScore(puntuacion);
      localStorage.setItem('bestScore', puntuacion.toString());
    }

    return (
      <div className="min-h-screen bg-black text-lime-300 flex flex-col items-center justify-center">
        <h1 className="text-5xl neon-title mb-6">DEFENSORES DEL ÁLGEBRA</h1>
        <p className="text-xl mb-4">Puntuación final: {puntuacion}</p>
        <p className="text-lg mb-4">Mejor puntuación: {bestScore}</p>

        <button
          className="neon-button bg-lime-600 px-8 py-4 rounded-lg shadow-lg text-2xl font-bold transition transform hover:scale-105"
          onClick={reiniciarJuego}
        >
          Jugar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-lime-200 flex flex-col items-center p-8 space-y-6">
      <h1 className="text-5xl neon-title mb-8">DEFENSORES DEL ÁLGEBRA</h1>

      {/* Barra de estado */}
      <div className="flex gap-8 text-2xl font-bold mb-8">
        <p>🪙 Puntos: {puntuacion}</p>
        <p>❤️ Vidas: {vidas}</p>
        <p>🌊 Nivel: {oleada}</p>
        <p>🏆 Mejor: {bestScore}</p>
      </div>

      {/* Contenedor del enemigo - "Campo de batalla" */}
      <div className="relative w-full sm:w-3/4 md:w-2/3 h-[70vh] md:h-[500px] bg-gray-900 bg-opacity-80 overflow-hidden rounded-xl border-8 border-lime-500 shadow-lg flex flex-col justify-between p-8">
        {/* Naves invasoras */}
        {enemigos.map((enemigo) => (
          <motion.div
            key={enemigo.id}
            className="absolute bg-red-600 text-white text-3xl md:text-4xl px-6 py-4 rounded-lg font-bold shadow-lg shadow-red-500"
            initial={{ y: -50 }}
            animate={{ y: enemigo.posicionY }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ left: `${enemigo.posX}%` }}
          >
            {enemigo.ecuacion}
          </motion.div>
        ))}

        {/* Área de respuestas */}
        <div className="absolute bottom-8 w-full flex justify-center space-x-4">
          <input
            type="number"
            className="p-4 text-2xl font-bold rounded-lg text-black border-4 border-lime-400 shadow-lg focus:ring-4 focus:ring-lime-300"
            placeholder="Tu respuesta..."
            value={respuestaUsuario}
            onChange={(e) => setRespuestaUsuario(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') manejarRespuesta();
            }}
          />
          <button
            className="bg-yellow-500 text-black font-bold text-2xl px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-400 transition transform hover:scale-105"
            onClick={manejarRespuesta}
          >
            Enviar 🚀
          </button>
        </div>
      </div>

      {/* Sección de retroalimentación */}
      {mostrarMensaje && (
        <div className="mt-6 bg-gray-800 text-white px-8 py-4 rounded-lg shadow-lg text-center text-2xl font-bold">
          {retroalimentacion}
        </div>
      )}

      
    </div>
  );
}