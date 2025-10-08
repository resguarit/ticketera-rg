import { useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';

interface TestResult {
    success: boolean;
    data?: any;
    error?: string;
}

export default function PaywayDebug() {
    const [environment, setEnvironment] = useState<'test' | 'prod'>('test');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Record<string, TestResult>>({});

    // Test 1: Health Check
    const testHealthCheck = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/payway-debug/test-health-check', {
                environment
            });
            setResults(prev => ({
                ...prev,
                healthCheck: { success: true, data: response.data }
            }));
        } catch (error: any) {
            setResults(prev => ({
                ...prev,
                healthCheck: {
                    success: false,
                    error: error.response?.data?.message || error.message,
                    data: error.response?.data
                }
            }));
        } finally {
            setLoading(false);
        }
    };

    // Test 2: Tokenization
    const [tokenForm, setTokenForm] = useState({
        card_number: '4507990000004905', // Tarjeta de prueba Visa
        card_holder_name: 'TITULAR PRUEBA',
        card_expiration_month: '12',
        card_expiration_year: '25',
        security_code: '123',
        card_holder_identification: {
            type: 'dni',
            number: '12345678'
        }
    });

    const testTokenization = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/payway-debug/test-tokenization', {
                ...tokenForm,
                environment
            });
            setResults(prev => ({
                ...prev,
                tokenization: { success: true, data: response.data }
            }));
        } catch (error: any) {
            setResults(prev => ({
                ...prev,
                tokenization: {
                    success: false,
                    error: error.response?.data?.message || error.message,
                    data: error.response?.data
                }
            }));
        } finally {
            setLoading(false);
        }
    };

    // Test 3: Payment
    const [paymentForm, setPaymentForm] = useState({
        payment_token: '',
        bin: '',
        amount: '100',
        installments: '1',
        customer_email: 'test@example.com'
    });

    const testPayment = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/payway-debug/test-payment', {
                ...paymentForm,
                environment
            });
            setResults(prev => ({
                ...prev,
                payment: { success: true, data: response.data }
            }));
        } catch (error: any) {
            setResults(prev => ({
                ...prev,
                payment: {
                    success: false,
                    error: error.response?.data?.message || error.message,
                    data: error.response?.data
                }
            }));
        } finally {
            setLoading(false);
        }
    };

    // Test 4: Payment Info
    const [paymentInfoForm, setPaymentInfoForm] = useState({
        payment_id: ''
    });

    const testPaymentInfo = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/payway-debug/test-payment-info', {
                ...paymentInfoForm,
                environment
            });
            setResults(prev => ({
                ...prev,
                paymentInfo: { success: true, data: response.data }
            }));
        } catch (error: any) {
            setResults(prev => ({
                ...prev,
                paymentInfo: {
                    success: false,
                    error: error.response?.data?.message || error.message,
                    data: error.response?.data
                }
            }));
        } finally {
            setLoading(false);
        }
    };

    // Test 5: Raw Connection
    const testRawConnection = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/payway-debug/test-raw-connection', {
                environment
            });
            setResults(prev => ({
                ...prev,
                rawConnection: { success: true, data: response.data }
            }));
        } catch (error: any) {
            setResults(prev => ({
                ...prev,
                rawConnection: {
                    success: false,
                    error: error.response?.data?.message || error.message,
                    data: error.response?.data
                }
            }));
        } finally {
            setLoading(false);
        }
    };

    // Get Logs
    const getLogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/payway-debug/get-logs');
            setResults(prev => ({
                ...prev,
                logs: { success: true, data: response.data }
            }));
        } catch (error: any) {
            setResults(prev => ({
                ...prev,
                logs: {
                    success: false,
                    error: error.response?.data?.message || error.message,
                    data: error.response?.data
                }
            }));
        } finally {
            setLoading(false);
        }
    };

    // Auto-fill payment form from tokenization result
    const autoFillPaymentForm = () => {
        if (results.tokenization?.success && results.tokenization.data) {
            setPaymentForm(prev => ({
                ...prev,
                payment_token: results.tokenization.data.token,
                bin: results.tokenization.data.bin
            }));
        }
    };

    // Auto-fill payment info from payment result
    const autoFillPaymentInfoForm = () => {
        if (results.payment?.success && results.payment.data) {
            setPaymentInfoForm({
                payment_id: results.payment.data.payment_id
            });
        }
    };

    return (
        <>
            <Head title="Payway Debug" />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            🔧 Payway SDK - Herramienta de Depuración
                        </h1>
                        <p className="text-gray-600 mb-4">
                            Prueba todas las funcionalidades del SDK de Payway para depurar la integración
                        </p>

                        {/* Environment Selector */}
                        <div className="flex items-center gap-4 mb-6">
                            <label className="font-semibold text-gray-700">Ambiente:</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEnvironment('test')}
                                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                        environment === 'test'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    🧪 Sandbox (Test)
                                </button>
                                <button
                                    onClick={() => setEnvironment('prod')}
                                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                        environment === 'prod'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    🚀 Producción
                                </button>
                            </div>
                            {environment === 'prod' && (
                                <span className="text-red-600 font-semibold">⚠️ CUIDADO: Usando credenciales de producción</span>
                            )}
                        </div>

                        {/* Tarjetas de prueba */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                            <h3 className="font-semibold text-yellow-900 mb-2">📋 Tarjetas de Prueba (Sandbox)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-yellow-800">
                                <div><strong>Visa:</strong> 4507990000004905</div>
                                <div><strong>Mastercard:</strong> 5299910010000015</div>
                                <div><strong>Amex:</strong> 373953192351004</div>
                                <div><strong>CVV:</strong> 123 (Amex: 1234)</div>
                                <div><strong>Fecha:</strong> Cualquier fecha futura (ej: 12/25)</div>
                                <div><strong>DNI:</strong> 12345678 (o cualquier número)</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Test 0: Raw Connection */}
                        <TestCard
                            title="0. Test de Conexión RAW"
                            description="Verifica las credenciales y variables de entorno sin hacer llamadas a la API"
                            onTest={testRawConnection}
                            loading={loading}
                            result={results.rawConnection}
                        >
                            <p className="text-sm text-gray-600">
                                Este test solo verifica que las credenciales estén configuradas correctamente.
                            </p>
                        </TestCard>

                        {/* Test 1: Health Check */}
                        <TestCard
                            title="1. Health Check"
                            description="Verifica que la API esté disponible y las credenciales sean válidas"
                            onTest={testHealthCheck}
                            loading={loading}
                            result={results.healthCheck}
                        >
                            <p className="text-sm text-gray-600">
                                Este es el primer test que debes ejecutar para confirmar que tu conexión funciona.
                            </p>
                        </TestCard>

                        {/* Test 2: Tokenization */}
                        <TestCard
                            title="2. Tokenización"
                            description="Crea un token a partir de los datos de una tarjeta"
                            onTest={testTokenization}
                            loading={loading}
                            result={results.tokenization}
                        >
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Número de tarjeta"
                                    value={tokenForm.card_number}
                                    onChange={(e) => setTokenForm({ ...tokenForm, card_number: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Nombre del titular"
                                    value={tokenForm.card_holder_name}
                                    onChange={(e) => setTokenForm({ ...tokenForm, card_holder_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={tokenForm.card_holder_identification.type}
                                        onChange={(e) => setTokenForm({ 
                                            ...tokenForm, 
                                            card_holder_identification: { 
                                                ...tokenForm.card_holder_identification, 
                                                type: e.target.value 
                                            } 
                                        })}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    >
                                        <option value="dni">DNI</option>
                                        <option value="cuil">CUIL</option>
                                        <option value="cuit">CUIT</option>
                                        <option value="passport">Pasaporte</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Número de documento"
                                        value={tokenForm.card_holder_identification.number}
                                        onChange={(e) => setTokenForm({ 
                                            ...tokenForm, 
                                            card_holder_identification: { 
                                                ...tokenForm.card_holder_identification, 
                                                number: e.target.value 
                                            } 
                                        })}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Mes (MM)"
                                        value={tokenForm.card_expiration_month}
                                        onChange={(e) => setTokenForm({ ...tokenForm, card_expiration_month: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Año (YY)"
                                        value={tokenForm.card_expiration_year}
                                        onChange={(e) => setTokenForm({ ...tokenForm, card_expiration_year: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="CVV"
                                        value={tokenForm.security_code}
                                        onChange={(e) => setTokenForm({ ...tokenForm, security_code: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                            </div>
                        </TestCard>

                        {/* Test 3: Payment */}
                        <TestCard
                            title="3. Realizar Pago"
                            description="Ejecuta un pago usando un token de tarjeta"
                            onTest={testPayment}
                            loading={loading}
                            result={results.payment}
                        >
                            <div className="space-y-3">
                                {results.tokenization?.success && (
                                    <button
                                        onClick={autoFillPaymentForm}
                                        className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200"
                                    >
                                        ✨ Auto-completar con token generado
                                    </button>
                                )}
                                <input
                                    type="text"
                                    placeholder="Token de pago"
                                    value={paymentForm.payment_token}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_token: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="BIN (primeros 6 dígitos)"
                                    value={paymentForm.bin}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, bin: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder="Monto (ARS)"
                                        value={paymentForm.amount}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Cuotas"
                                        value={paymentForm.installments}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, installments: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Email del cliente"
                                    value={paymentForm.customer_email}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, customer_email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                        </TestCard>

                        {/* Test 4: Payment Info */}
                        <TestCard
                            title="4. Consultar Pago"
                            description="Obtiene la información de un pago existente"
                            onTest={testPaymentInfo}
                            loading={loading}
                            result={results.paymentInfo}
                        >
                            <div className="space-y-3">
                                {results.payment?.success && (
                                    <button
                                        onClick={autoFillPaymentInfoForm}
                                        className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200"
                                    >
                                        ✨ Auto-completar con último pago
                                    </button>
                                )}
                                <input
                                    type="text"
                                    placeholder="ID del pago"
                                    value={paymentInfoForm.payment_id}
                                    onChange={(e) => setPaymentInfoForm({ payment_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                        </TestCard>

                        {/* Test 5: Logs */}
                        <TestCard
                            title="5. Ver Logs Recientes"
                            description="Muestra los últimos logs relacionados con Payway"
                            onTest={getLogs}
                            loading={loading}
                            result={results.logs}
                        >
                            <p className="text-sm text-gray-600">
                                Obtiene las últimas entradas del log que contienen información de Payway.
                            </p>
                        </TestCard>
                    </div>
                </div>
            </div>
        </>
    );
}

interface TestCardProps {
    title: string;
    description: string;
    onTest: () => void;
    loading: boolean;
    result?: TestResult;
    children: React.ReactNode;
}

function TestCard({ title, description, onTest, loading, result, children }: TestCardProps) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-sm text-gray-600 mb-4">{description}</p>

            <div className="mb-4">{children}</div>

            <button
                onClick={onTest}
                disabled={loading}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                    loading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
                {loading ? '⏳ Ejecutando...' : '▶️ Ejecutar Test'}
            </button>

            {result && (
                <div className="mt-4">
                    <div
                        className={`p-4 rounded-md ${
                            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span
                                className={`font-semibold ${
                                    result.success ? 'text-green-800' : 'text-red-800'
                                }`}
                            >
                                {result.success ? '✅ Exitoso' : '❌ Error'}
                            </span>
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                {showDetails ? '🔼 Ocultar' : '🔽 Ver detalles'}
                            </button>
                        </div>

                        {showDetails && (
                            <div className="mt-3">
                                <pre className="text-xs bg-white p-3 rounded border overflow-x-auto max-h-96 overflow-y-auto">
                                    {JSON.stringify(result.data || result.error, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
