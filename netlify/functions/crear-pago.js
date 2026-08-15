// netlify/functions/crear-pago-vpd.js
//
// Igual que crear-pago.js, pero para La Venta por Dentro.
// Crea la Preferencia de pago en Mercado Pago y redirige automáticamente
// a la página de gracias de este programa apenas se aprueba el pago.
//
// Usa la misma variable de entorno MP_ACCESS_TOKEN ya configurada en Netlify.

exports.handler = async function (event, context) {
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken) {
    return {
      statusCode: 500,
      body: "Falta configurar la variable de entorno MP_ACCESS_TOKEN en Netlify.",
    };
  }

  const preference = {
    items: [
      {
        title: "La Venta por Dentro",
        quantity: 1,
        unit_price: 120000,
        currency_id: "ARS",
      },
    ],
    back_urls: {
      success: "PEGAR_URL_DEL_SITIO_VPD_ACA/?pago=mp",
      failure: "PEGAR_URL_DEL_SITIO_VPD_ACA/",
      pending: "PEGAR_URL_DEL_SITIO_VPD_ACA/",
    },
    auto_return: "approved",
  };

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok || !data.init_point) {
      console.error("Error de Mercado Pago:", data);
      return {
        statusCode: 302,
        headers: { Location: "https://tallerdecierregracias.netlify.app/vpd.html" },
      };
    }

    return {
      statusCode: 302,
      headers: { Location: data.init_point },
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 302,
      headers: { Location: "https://tallerdecierregracias.netlify.app/vpd.html" },
    };
  }
};
