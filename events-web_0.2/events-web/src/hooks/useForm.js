import { useState } from 'react';

// Validación en tiempo real: valida al salir de un campo y, una vez tocado, en cada cambio.
// Los ids de los inputs deben coincidir con los nombres de los campos.
export function useForm(inicial, validar) {
  const [valores, setValores] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [tocados, setTocados] = useState({});

  const onChange = (e) => {
    const { name, value } = e.target;
    const nuevos = { ...valores, [name]: value };
    setValores(nuevos);

    const calculados = validar(nuevos);
    setErrores((previos) => {
      const siguientes = { ...previos };
      Object.keys(tocados).forEach((campo) => {
        if (tocados[campo]) siguientes[campo] = calculados[campo];
      });
      return siguientes;
    });
  };

  const onBlur = (e) => {
    const { name } = e.target;
    setTocados((t) => ({ ...t, [name]: true }));
    setErrores((previos) => ({ ...previos, [name]: validar(valores)[name] }));
  };

  const enfocarPrimero = (mapa) => {
    const primero = Object.keys(mapa).find((campo) => mapa[campo]);
    if (primero) document.getElementById(primero)?.focus();
    return primero;
  };

  // Valida todo al enviar; si hay errores, lleva el foco al primer campo con problema
  const validarTodo = () => {
    const calculados = validar(valores);
    setTocados(Object.fromEntries(Object.keys(valores).map((k) => [k, true])));
    setErrores(calculados);
    return !enfocarPrimero(calculados);
  };

  // Errores que devuelve la API: [{ campo, mensaje }]
  const ponerErroresServidor = (lista = []) => {
    const mapa = Object.fromEntries(lista.map((e) => [e.campo, e.mensaje]));
    setErrores((previos) => ({ ...previos, ...mapa }));
    enfocarPrimero(mapa);
  };

  // Reemplaza los valores (por ejemplo, al cargar un evento para editarlo)
  const reiniciar = (nuevos) => {
    setValores(nuevos);
    setErrores({});
    setTocados({});
  };

  return { valores, errores, onChange, onBlur, validarTodo, ponerErroresServidor, reiniciar };
}
