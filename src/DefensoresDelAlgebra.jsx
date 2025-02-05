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
        setOleada((prev) => prev + 1); // Genera nueva ecuación después del mensaje
      }
    }, 3000); // Ocultar después de 3 segundos
  }

  if (finDelJuego) {
    return (
      <div className="min-h-screen bg-black text-lime-300 flex flex-col items-center justify-center">
        <h1 className="text-5xl neon-title mb-6">DEFENSORES DEL ÁLGEBRA</h1>
        <p className="text-xl mb-4">Puntuación final: {puntuacion}</p>
        <button
          className="neon-button bg-lime-600 px-6 py-3 rounded-full"
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
    <div className="min-h-screen bg-black text-lime-200 flex flex-col items-center p-6">
      <h1 className="text-4xl neon-title mb-6">DEFENSORES DEL ÁLGEBRA</h1>

      {/* Barra de estado */}
      <div className="flex gap-6 mb-6">
        <p>🪙 Puntos: {puntuacion}</p>
        <p>❤️ Vidas: {vidas}</p>
        <p>🌊 Oleada: {oleada}</p>
      </div>

      {/* Contenedor del enemigo - "Campo de batalla" */}
      <div className="relative w-full sm:w-3/4 md:w-2/3 h-[70vh] md:h-[500px] bg-gray-900 bg-opacity-80 overflow-hidden rounded-xl border-10 border-lime-400 shadow-[0_0_20px_rgba(0,255,0,0.6)] flex flex-col justify-between p-6">
        {/* Naves invasoras */}
        {enemigos.map((enemigo) => (
          <motion.div
            key={enemigo.id}
            className="absolute bg-red-600 text-white text-2xl md:text-3xl px-5 py-3 rounded-lg font-bold shadow-lg shadow-red-500"
            initial={{ y: -50 }}
            animate={{ y: enemigo.posicion }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ left: '50%', transform: 'translateX(-50%)' }}
          >
            {enemigo.ecuacion}
          </motion.div>
        ))}

        {/* Área de respuestas */}
        <div className="absolute bottom-6 w-full flex justify-center">
          <input 
            type="number" 
            className="p-3 rounded-lg text-black border-4 border-lime-300" 
            placeholder="Tu respuesta..."
            value={respuestaUsuario}
            onChange={(e) => setRespuestaUsuario(e.target.value)}
          />
          <button className="bg-lime-500 px-4 py-2 rounded-lg ml-2" onClick={manejarRespuesta}>Enviar</button>
        </div>
      </div>

      {/* Sección de retroalimentación (en lugar del modal) */}
      {mostrarMensaje && (
        <div className="mt-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg text-center text-xl">
          {retroalimentacion}
        </div>
      )}
    </div>
  );
}