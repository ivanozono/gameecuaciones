import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Generar ecuaciones con solución entera
function generarEcuacion() {
  let a, b, c, solucion;
  do {
    a = Math.floor(Math.random() * 8) + 2; 
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

  const intervaloMovimientoRef = useRef(null);

  function crearEnemigo() {
    const { ecuacion, solucion } = generarEcuacion();
    return { id: Date.now().toString(), ecuacion, solucion, posicion: 0 };
  }

  useEffect(() => {
    const nuevoEnemigo = crearEnemigo();
    setEnemigos([nuevoEnemigo]);
    setEcuacionActiva(nuevoEnemigo);
  }, [oleada]);

  useEffect(() => {
    if (finDelJuego) return;
    if (intervaloMovimientoRef.current) {
      clearInterval(intervaloMovimientoRef.current);
    }
    intervaloMovimientoRef.current = setInterval(() => {
      setEnemigos((prev) =>
        prev.map((enemigo) => ({ ...enemigo, posicion: enemigo.posicion + 10 }))
      );
    }, 1000);
    return () => clearInterval(intervaloMovimientoRef.current);
  }, [finDelJuego]);

  useEffect(() => {
    setEnemigos((prev) =>
      prev.filter((enemigo) => {
        if (enemigo.posicion < 400) {
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
      if (nuevasVidas <= 0) setFinDelJuego(true);
      return nuevasVidas;
    });
  }

  function manejarRespuesta() {
    if (!ecuacionActiva) return;
    const numero = parseInt(respuestaUsuario, 10);
    if (Number.isNaN(numero)) return;

    if (numero === ecuacionActiva.solucion) {
      setPuntuacion((prev) => prev + 10);
      mostrarMensajeDeRetroalimentacion(`✅ ¡Correcto! La respuesta es ${ecuacionActiva.solucion}`);
    } else {
      perderVida();
      mostrarMensajeDeRetroalimentacion(`❌ ¡Incorrecto! La respuesta correcta era: ${ecuacionActiva.solucion}`);
    }

    setRespuestaUsuario('');
  }

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

  if (finDelJuego) {
    return (
      <div className="min-h-screen bg-black text-lime-300 flex flex-col items-center justify-center">
        <h1 className="text-5xl neon-title mb-6">DEFENSORES DEL ÁLGEBRA</h1>
        <p className="text-xl mb-4">Puntuación final: {puntuacion}</p>
        <button
          className="neon-button bg-lime-600 px-8 py-4 rounded-lg shadow-lg text-2xl font-bold transition transform hover:scale-105"
          onClick={() => {
            setPuntuacion(0);
            setVidas(3);
            setOleada(1);
            setFinDelJuego(false);
            setEcuacionActiva(null);
            setEnemigos([]);
          }}
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
      </div>

      {/* Contenedor del enemigo - "Campo de batalla" */}
      <div className="relative w-full sm:w-3/4 md:w-2/3 h-[70vh] md:h-[500px] bg-gray-900 bg-opacity-80 overflow-hidden rounded-xl border-8 border-lime-500 shadow-lg flex flex-col justify-between p-8">
        {/* Naves invasoras */}
        {enemigos.map((enemigo) => (
          <motion.div
            key={enemigo.id}
            className="absolute bg-red-600 text-white text-3xl md:text-4xl px-6 py-4 rounded-lg font-bold shadow-lg shadow-red-500"
            initial={{ y: -50 }}
            animate={{ y: enemigo.posicion }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ left: '50%', transform: 'translateX(-50%)' }}
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
          />
          <button className="bg-yellow-500 text-black font-bold text-2xl px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-400 transition transform hover:scale-105" onClick={manejarRespuesta}>
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