"use client"

import { useState, useEffect } from "react"
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaSync } from "react-icons/fa"
import { testApiConnection, testAuthConnection } from "../utils/connectionTest"

const ConnectionTest = () => {
  const [apiTest, setApiTest] = useState(null)
  const [authTest, setAuthTest] = useState(null)
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)

    // Test API connection
    const apiResult = await testApiConnection()
    setApiTest(apiResult)

    // Test authentication
    const authResult = await testAuthConnection()
    setAuthTest(authResult)

    setLoading(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Connection Test</h2>
        <button
          onClick={runTests}
          disabled={loading}
          className="flex items-center text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
        >
          {loading ? <FaSync className="animate-spin mr-1" /> : <FaSync className="mr-1" />}
          Retest
        </button>
      </div>

      <div className="space-y-4">
        {/* API Connection Test */}
        <div className="border rounded-md p-4">
          <div className="flex items-center mb-2">
            <h3 className="font-medium text-gray-700">API Connection</h3>
            {apiTest && (
              <span className="ml-2">
                {apiTest.success ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <FaTimesCircle className="text-red-500" />
                )}
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-gray-500 text-sm">Testing connection...</div>
          ) : apiTest ? (
            <div>
              {apiTest.success ? (
                <div className="text-sm">
                  <p className="text-green-600 font-medium">Connection successful</p>
                  <p className="text-gray-600">Latency: {apiTest.latency}ms</p>
                  <p className="text-gray-600">
                    API URL: {process.env.REACT_APP_API_URL || "http://localhost:5000/api"}
                  </p>
                  {apiTest.data && apiTest.data.environment && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
                      <p>Node Env: {apiTest.data.environment.nodeEnv}</p>
                      <p>Frontend URL: {apiTest.data.environment.frontendUrl}</p>
                      <p>MongoDB: {apiTest.data.environment.mongoConnected ? "Connected" : "Disconnected"}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm">
                  <p className="text-red-600 font-medium">Connection failed</p>
                  <p className="text-gray-600">{apiTest.message}</p>
                  <p className="text-gray-600">Error: {apiTest.error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No test results</div>
          )}
        </div>

        {/* Auth Test */}
        <div className="border rounded-md p-4">
          <div className="flex items-center mb-2">
            <h3 className="font-medium text-gray-700">Authentication</h3>
            {authTest && (
              <span className="ml-2">
                {authTest.success ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <FaTimesCircle className="text-red-500" />
                )}
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-gray-500 text-sm">Testing authentication...</div>
          ) : authTest ? (
            <div>
              {authTest.success ? (
                <div className="text-sm">
                  <p className="text-green-600 font-medium">Authentication successful</p>
                  {authTest.data && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <p>User: {authTest.data.name}</p>
                      <p>Email: {authTest.data.email}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm">
                  <p className="text-yellow-600 font-medium">
                    <FaExclamationTriangle className="inline mr-1" />
                    {authTest.message}
                  </p>
                  {authTest.error && <p className="text-gray-600">Error: {authTest.error}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No test results</div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>This tool helps diagnose connection issues between the frontend and backend.</p>
        <p>If you're experiencing problems, please check your environment variables and network settings.</p>
      </div>
    </div>
  )
}

export default ConnectionTest
