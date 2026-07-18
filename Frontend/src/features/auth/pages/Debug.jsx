import React, { useEffect, useState } from 'react'
import { getMe } from '../services/auth.api'

const Debug = () => {
    const [result, setResult] = useState(null)
    const [errorInfo, setErrorInfo] = useState(null)

    useEffect(() => {
        getMe()
            .then((data) => setResult(data))
            .catch((err) => {
                setErrorInfo({
                    message: err.message,
                    status: err.response?.status,
                    data: err.response?.data,
                })
            })
    }, [])

    return (
        <main style={{ padding: 20, fontFamily: "monospace" }}>
            <h1>Auth Debug</h1>
            <p><strong>document.cookie:</strong> {document.cookie || "(no cookies visible — but httpOnly cookies never show here, that's normal)"}</p>
            <h3>GET /api/auth/get-me result:</h3>
            {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
            {errorInfo && (
                <div>
                    <p style={{ color: "red" }}>Request failed:</p>
                    <pre>{JSON.stringify(errorInfo, null, 2)}</pre>
                </div>
            )}
        </main>
    )
}

export default Debug
