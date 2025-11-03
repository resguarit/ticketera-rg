import React, { useState, useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';

export default function TestPayway() {
    const urlSandbox = "https://developers-ventasonline.payway.com.ar/api/v2";
    const urlProduccion = "https://live.decidir.com/api/v2";

    const { post, processing, errors, setData } = useForm({
        payment_token: '',
        bin: '',
    });

    useEffect(() => {
        // Inicializar el SDK de Payway cuando el componente se monta
        const decidir = new (window as any).Decidir(urlSandbox);
        decidir.setPublishableKey('2GdQYEHoXH5NXn8nbtniE1Jqo0F3fC8y');

        const form = document.querySelector('#formulario');

        const handleSubmit = (event: Event) => {
            event.preventDefault();
            decidir.createToken(form, handleTokenResponse);
        };

        form?.addEventListener('submit', handleSubmit);

        return () => {
            form?.removeEventListener('submit', handleSubmit);
        };
    }, []); 

    const handleTokenResponse = (status: number, response: any) => {
                if (status !== 200 && status !== 201) {
                    alert('Error al validar los datos. Por favor, revisa la información.');
                    console.error(response);
                } else {
                    // Token creado, ahora enviamos al backend de Laravel
                    console.log('Token creado:', response);
                    alert('Token creado: ' + JSON.stringify(response.id) + ' - Bin: ' + JSON.stringify(response.bin));
                    const paymentData = {
                        payment_token: response.id,
                        bin: response.bin
                    };

                    router.post(route('checkout.payway.process'), paymentData);
                }
            }

    return (
        <form action="" method="post" id="formulario" >
        <fieldset>
                <ul>
            <li>
                <label htmlFor="card_number">Numero de tarjeta:</label>
                <input type="text" data-decidir="card_number" placeholder="XXXXXXXXXXXXXXXX" value="4507990000004905"/>
            </li>
            <li>
                <label htmlFor="security_code">Codigo de seguridad:</label>
            <input type="text"  data-decidir="security_code" placeholder="XXX" value="123" />
            </li>
            <li>
                <label htmlFor="card_expiration_month">Mes de vencimiento:</label>
                <input type="text"  data-decidir="card_expiration_month" placeholder="MM" value="12"/>
            </li>
            <li>
                <label htmlFor="card_expiration_year">Año de vencimiento:</label>
                <input type="text"  data-decidir="card_expiration_year" placeholder="AA" value="30"/>
            </li>
            <li>
                <label htmlFor="card_holder_name">Nombre del titular:</label>
                <input type="text" data-decidir="card_holder_name" placeholder="TITULAR" value="TITULAR"/>
            </li>
            <li>
                <label htmlFor="card_holder_doc_type">Tipo de documento:</label>
                <select data-decidir="card_holder_doc_type">
                            <option value="dni">DNI</option>
                        </select>
            </li>
            <li>
                <label htmlFor="card_holder_doc_number">Numero de documento:</label>
                <input type="text" data-decidir="card_holder_doc_number" placeholder="XXXXXXXXXX" value="27859328"/>
            </li>
            </ul>
            <input style={{ backgroundColor: 'blue', color: 'white' }} type="submit" value="Pagar" />
        </fieldset>
        </form>
    );
}