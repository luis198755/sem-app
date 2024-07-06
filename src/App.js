import React, { useState, useEffect } from 'react';

const SemaforoBits = () => {
  const [numSemaforos, setNumSemaforos] = useState(10);
  const [numEscenarios, setNumEscenarios] = useState(1);
  const [numCiclos, setNumCiclos] = useState(1);
  const [numEventos, setNumEventos] = useState(1);
  const [escenarios, setEscenarios] = useState([]);
  const [tiempos, setTiempos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [numerosSemaforos, setNumerosSemaforos] = useState([]); // New state to store traffic light numbers
  const [tiemposPorCiclo, setTiemposPorCiclo] = useState([]);


  const etiquetas = [
    "Escenario P",
    "Destello de verde",
    "Destello de verde",
    "Destello de verde",
    "Destello de verde",
    "Destello de verde",
    "Destello de verde",
    "Destello de verde",
    "Destello de verde",
    "Ambar"
  ];

  useEffect(() => {
    const totalEscenarios = numEscenarios * 10;
    setEscenarios(Array(totalEscenarios).fill(0));
    setNumerosSemaforos(Array(totalEscenarios).fill(0)); // Initialize numerosSemaforos

    const nuevosTiempos = Array(numCiclos).fill().map(() =>
      Array(totalEscenarios).fill().map((_, index) => {
        if (index % 10 === 0) return 0; // Escenario P, editable
        if (index % 10 === 9) return 3; // Ambar, fijo en 3 segundos
        return 0.375; // Destello de verde, fijo en 0.375 segundos
      })
    );
    setTiempos(nuevosTiempos);

    setTiemposPorCiclo(nuevosTiempos);


  }, [numEscenarios, numCiclos]);

  useEffect(() => {
    setEventos(Array(numEventos).fill().map(() => ({
      hora: 0,
      minuto: 0,
      cicloSeleccionado: 1,
      offset: 0
    })));
  }, [numEventos]);

  const generateStructuredJSON = () => {
    const json = {
      fases: {
        "1": [numSemaforos]
      },
      escenarios: {
        "1": [0, ...escenarios] // Agregar un cero al inicio del array de escenarios
      },
      ciclos: {},
      eventos: {}
    };

    // Agregar ciclos
    // Agregar ciclos con un cero al inicio de cada array
    tiemposPorCiclo.forEach((ciclo, index) => {
      json.ciclos[index + 1] = [0, ...ciclo];
    });

    // Agregar eventos
    eventos.forEach((evento, index) => {
      json.eventos[index + 1] = [evento.hora, evento.minuto, evento.cicloSeleccionado, evento.offset];
    });

    return JSON.stringify(json, null, 2);
  };

  const handleSemaforosChange = (e) => {
    setNumSemaforos(parseInt(e.target.value, 10));
  };

  const handleEscenariosChange = (e) => {
    setNumEscenarios(parseInt(e.target.value, 10));
  };

  const handleCiclosChange = (e) => {
    setNumCiclos(parseInt(e.target.value, 10));
  };

  const handleEventosChange = (e) => {
    setNumEventos(parseInt(e.target.value, 10));
  };

  const handleEventoChange = (index, campo, valor) => {
    const nuevosEventos = [...eventos];
    nuevosEventos[index] = { ...nuevosEventos[index], [campo]: valor };
    setEventos(nuevosEventos);
  };

  const handleTiempoChange = (ciclo, escenario, valor) => {
    const nuevosTiempos = [...tiempos];
    nuevosTiempos[ciclo][escenario] = parseFloat(valor);
    setTiempos(nuevosTiempos);

    // Update tiemposPorCiclo
    setTiemposPorCiclo(prevTiempos => {
      const nuevosTiemposPorCiclo = [...prevTiempos];
      nuevosTiemposPorCiclo[ciclo][escenario] = parseFloat(valor);
      return nuevosTiemposPorCiclo;
    });
  };

  const getBitValue = (numero, position) => {
    return (numero >>> position) & 1;
  };

  const toggleBit = (escenarioIndex, position) => {
    setEscenarios(prevEscenarios => {
      const newEscenarios = [...prevEscenarios];
      newEscenarios[escenarioIndex] = newEscenarios[escenarioIndex] ^ (1 << position);
      newEscenarios[escenarioIndex] = newEscenarios[escenarioIndex] >>> 0;

      // Update numerosSemaforos when toggling bits
      setNumerosSemaforos(prevNumeros => {
        const newNumeros = [...prevNumeros];
        newNumeros[escenarioIndex] = newEscenarios[escenarioIndex];
        return newNumeros;
      });

      return newEscenarios;
    });
  };

  const handleInputChange = (escenarioIndex, e) => {
    let valor = parseInt(e.target.value, 10);
    if (!isNaN(valor)) {
      valor = valor >>> 0;
      setEscenarios(prevEscenarios => {
        const newEscenarios = [...prevEscenarios];
        newEscenarios[escenarioIndex] = valor;

        // Update numerosSemaforos when changing input
        setNumerosSemaforos(prevNumeros => {
          const newNumeros = [...prevNumeros];
          newNumeros[escenarioIndex] = valor;
          return newNumeros;
        });

        return newEscenarios;
      });
    }
  };

  const renderSemaforos = (numero, escenarioIndex) => {
    return [...Array(numSemaforos)].map((_, index) => {
      const redBit = 31 - index * 3;
      const yellowBit = 30 - index * 3;
      const greenBit = 29 - index * 3;
      return (
        <div key={index} className="w-8 h-20 mx-1 rounded-full flex flex-col items-center justify-between bg-gray-200">
          <div
            className={`w-6 h-6 rounded-full ${getBitValue(numero, redBit) ? 'bg-red-500' : 'bg-gray-400'} cursor-pointer`}
            onClick={() => toggleBit(escenarioIndex, redBit)}
          ></div>
          <div
            className={`w-6 h-6 rounded-full ${getBitValue(numero, yellowBit) ? 'bg-yellow-500' : 'bg-gray-400'} cursor-pointer`}
            onClick={() => toggleBit(escenarioIndex, yellowBit)}
          ></div>
          <div
            className={`w-6 h-6 rounded-full ${getBitValue(numero, greenBit) ? 'bg-green-500' : 'bg-gray-400'} cursor-pointer`}
            onClick={() => toggleBit(escenarioIndex, greenBit)}
          ></div>
        </div>
      );
    });
  };

  const getEtiquetaColor = (etiqueta) => {
    if (etiqueta.startsWith("Escenario P")) return "bg-blue-200";
    if (etiqueta === "Destello de verde") return "bg-green-200";
    if (etiqueta === "Ambar") return "bg-yellow-200";
    return "bg-gray-200";
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Semáforos de Bits Interactivos (Con Ciclos, Tiempos y Eventos)</h1>
      <div className="mb-4">
        <label htmlFor="numSemaforos" className="block mb-2">Número de semáforos a mostrar:</label>
        <select
          id="numSemaforos"
          value={numSemaforos}
          onChange={handleSemaforosChange}
          className="w-full p-2 border rounded"
        >
          {[...Array(10)].map((_, i) => (
            <option key={i} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="numEscenarios" className="block mb-2">Número de Escenarios (x10):</label>
        <select
          id="numEscenarios"
          value={numEscenarios}
          onChange={handleEscenariosChange}
          className="w-full p-2 border rounded"
        >
          {[...Array(10)].map((_, i) => (
            <option key={i} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="numCiclos" className="block mb-2">Número de Ciclos:</label>
        <select
          id="numCiclos"
          value={numCiclos}
          onChange={handleCiclosChange}
          className="w-full p-2 border rounded"
        >
          {[...Array(8)].map((_, i) => (
            <option key={i} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>

      {escenarios.map((numero, index) => {
        const grupoIndex = Math.floor(index / 10);
        const etiquetaIndex = index % 10;
        const etiqueta = etiquetaIndex === 0 ? `Escenario P${grupoIndex + 1}` : etiquetas[etiquetaIndex];
        const etiquetaColorClass = getEtiquetaColor(etiqueta);
        return (
          <div key={index} className="mb-6 p-3 border-t">
            <h3 className={`text-lg font-medium mb-2 p-2 rounded ${etiquetaColorClass}`}>
              Escenario {index + 1} - {etiqueta}
            </h3>
            <div className="flex justify-center mb-4">
              {renderSemaforos(numero, index)}
            </div>
            {/* <div className="text-center space-y-2">
              <p>Valor decimal: {numerosSemaforos[index]}</p>
              <p>Valor hexadecimal: 0x{numerosSemaforos[index].toString(16).toUpperCase().padStart(8, '0')}</p>
            </div> */}
            <div className="mt-4">
              <h4 className="font-medium mb-2">Tiempos por ciclo (segundos):</h4>
              <div className="grid grid-cols-4 gap-2">
                {tiempos.map((ciclo, cicloIndex) => (
                  <div key={cicloIndex} className="flex items-center">
                    <span className="mr-2">Ciclo {cicloIndex + 1}:</span>
                    <input
                      type="number"
                      value={ciclo[index]}
                      onChange={(e) => handleTiempoChange(cicloIndex, index, e.target.value)}
                      className="w-20 p-1 border rounded"
                      step="0.001"
                      min="0"
                      disabled={etiquetaIndex !== 0}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <div className="mb-4">
        <label htmlFor="numEventos" className="block mb-2">Número de Eventos:</label>
        <select
          id="numEventos"
          value={numEventos}
          onChange={handleEventosChange}
          className="w-full p-2 border rounded"
        >
          {[...Array(10)].map((_, i) => (
            <option key={i} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Eventos</h2>
        {eventos.map((evento, index) => (
          <div key={index} className="mb-4 p-3 border rounded">
            <h3 className="font-medium mb-2">Evento {index + 1}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor={`hora-${index}`} className="block mb-1">Hora:</label>
                <input
                  type="number"
                  id={`hora-${index}`}
                  value={evento.hora}
                  onChange={(e) => handleEventoChange(index, 'hora', parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                  min="0"
                  max="23"
                />
              </div>
              <div>
                <label htmlFor={`minuto-${index}`} className="block mb-1">Minuto:</label>
                <input
                  type="number"
                  id={`minuto-${index}`}
                  value={evento.minuto}
                  onChange={(e) => handleEventoChange(index, 'minuto', parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                  min="0"
                  max="59"
                />
              </div>
              <div>
                <label htmlFor={`ciclo-${index}`} className="block mb-1">Ciclo Seleccionado:</label>
                <select
                  id={`ciclo-${index}`}
                  value={evento.cicloSeleccionado}
                  onChange={(e) => handleEventoChange(index, 'cicloSeleccionado', parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                >
                  {[...Array(numCiclos)].map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`offset-${index}`} className="block mb-1">Offset (segundos):</label>
                <input
                  type="number"
                  id={`offset-${index}`}
                  value={evento.offset}
                  onChange={(e) => handleEventoChange(index, 'offset', parseFloat(e.target.value))}
                  className="w-full p-2 border rounded"
                  step="0.1"
                  min="0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Escenarios</h2>
        <textarea
          className="w-full h-40 p-2 border rounded"
          readOnly
          value={`Escenarios: [${escenarios.join(', ')}]`}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Tiempos por Ciclo</h2>
        <textarea
          className="w-full h-40 p-2 border rounded"
          readOnly
          value={tiemposPorCiclo.map((ciclo, index) =>
            `Ciclo ${index + 1}: [${ciclo.join(', ')}]`
          ).join('\n')}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Eventos</h2>
        <textarea
          className="w-full h-40 p-2 border rounded"
          readOnly
          value={eventos.map((evento, index) =>
            `Evento${index + 1} = [${evento.hora}, ${evento.minuto}, ${evento.cicloSeleccionado}, ${evento.offset}]`
          ).join('\n')}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">JSON Estructurado</h2>
        <textarea
          className="w-full h-80 p-2 border rounded"
          readOnly
          value={generateStructuredJSON()}
        />
      </div>
    </div>
  );
};

export default SemaforoBits;