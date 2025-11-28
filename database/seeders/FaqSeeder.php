<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FaqCategory;
use App\Models\Faq;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ticketsCategory = FaqCategory::where('title', 'Compra de Tickets')->first();
        $paymentCategory = FaqCategory::where('title', 'Pagos y Facturación')->first();
        $eventsCategory = FaqCategory::where('title', 'Eventos')->first();
        $accountCategory = FaqCategory::where('title', 'Cuenta y Perfil')->first();

        $faqs = [
            // Compra de Tickets
            [
                'faq_category_id' => $ticketsCategory->id,
                'question' => '¿Cómo puedo comprar tickets?',
                'answer' => 'Puedes comprar tickets navegando por nuestros eventos, seleccionando el que te interese y siguiendo el proceso de compra. Aceptamos tarjetas de crédito, débito y transferencias bancarias.',
                'order' => 1,
            ],
            [
                'faq_category_id' => $ticketsCategory->id,
                'question' => '¿Puedo cancelar mi compra?',
                'answer' => 'Sí, puedes cancelar tu compra hasta 24 horas antes del evento. El reembolso se procesará en 5-7 días hábiles a tu método de pago original.',
                'order' => 2,
            ],
            [
                'faq_category_id' => $ticketsCategory->id,
                'question' => '¿Los precios incluyen impuestos?',
                'answer' => 'Sí, todos los precios mostrados incluyen impuestos y tasas de servicio. No hay costos ocultos.',
                'order' => 3,
            ],
            [
                'faq_category_id' => $ticketsCategory->id,
                'question' => '¿Hay límite de tickets por persona?',
                'answer' => 'Sí, generalmente hay un límite de 10 tickets por persona por evento para garantizar disponibilidad para todos.',
                'order' => 4,
            ],

            // Pagos y Facturación
            [
                'faq_category_id' => $paymentCategory->id,
                'question' => '¿Qué métodos de pago aceptan?',
                'answer' => 'Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express), transferencias bancarias y billeteras digitales como MercadoPago.',
                'order' => 1,
            ],
            [
                'faq_category_id' => $paymentCategory->id,
                'question' => '¿Es seguro pagar en línea?',
                'answer' => 'Absolutamente. Utilizamos encriptación SSL de 256 bits y cumplimos con los estándares PCI DSS para proteger tu información financiera.',
                'order' => 2,
            ],
            [
                'faq_category_id' => $paymentCategory->id,
                'question' => '¿Puedo obtener una factura?',
                'answer' => 'Sí, recibirás automáticamente una factura por email después de completar tu compra. También puedes descargarla desde tu cuenta.',
                'order' => 3,
            ],

            // Eventos
            [
                'faq_category_id' => $eventsCategory->id,
                'question' => '¿Qué pasa si se cancela un evento?',
                'answer' => 'Si un evento se cancela, recibirás un reembolso completo automáticamente. Te notificaremos por email y SMS sobre la cancelación.',
                'order' => 1,
            ],
            [
                'faq_category_id' => $eventsCategory->id,
                'question' => '¿Puedo transferir mis tickets a otra persona?',
                'answer' => 'Sí, puedes transferir tus tickets a través de tu cuenta. La persona que recibe debe tener una cuenta en RG Entradas.',
                'order' => 2,
            ],
            [
                'faq_category_id' => $eventsCategory->id,
                'question' => '¿Qué pasa si llego tarde al evento?',
                'answer' => 'Esto depende de la política del organizador del evento. Algunos eventos permiten entrada tardía, otros no. Revisa los detalles del evento.',
                'order' => 3,
            ],

            // Cuenta y Perfil
            [
                'faq_category_id' => $accountCategory->id,
                'question' => '¿Cómo creo una cuenta?',
                'answer' => "Puedes crear una cuenta haciendo clic en 'Iniciar Sesión' y luego en 'Crear cuenta'. Solo necesitas tu email y una contraseña segura.",
                'order' => 1,
            ],
            [
                'faq_category_id' => $accountCategory->id,
                'question' => '¿Olvidé mi contraseña, qué hago?',
                'answer' => "Haz clic en '¿Olvidaste tu contraseña?' en la página de inicio de sesión. Te enviaremos un enlace para restablecerla.",
                'order' => 2,
            ],
            [
                'faq_category_id' => $accountCategory->id,
                'question' => '¿Puedo cambiar mi información personal?',
                'answer' => 'Sí, puedes actualizar tu información personal en cualquier momento desde la configuración de tu cuenta.',
                'order' => 3,
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::create($faq);
        }
    }
}