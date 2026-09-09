import { useState } from 'react'
import TopCompanionBar from './components/TopCompanionBar'
import NavBar from './components/NavBar'
import InputCard from './components/InputCard'
import LoadingOverlay from './components/LoadingOverlay'
import Step1Result from './components/Step1Result'
import Step2Result from './components/Step2Result'
import Step3Result from './components/Step3Result'
import { analyzeJD } from './services/difyApi'
import { mockStep1, mockStep2, mockStep3 } from './data/mockData'

export default function App() {
  const [jdText, setJdText] = useState('')
  const [activeTab, setActiveTab] = useState('粘贴JD文本')
  const [step, setStep] = useState(-1) // -1 = input, 0 = loading, 1/2/3 = result steps
  const [stepResults, setStepResults] = useState({})

  const handleSubmit = async () => {
    if (!jdText.trim()) return
    setStep(0)
    try {
      const outputs = await analyzeJD(jdText)
      setStepResults({ step1: outputs, step2: mockStep2, step3: mockStep3 })
    } catch (err) {
      console.warn('Dify API 调用失败，降级使用 mock 数据:', err)
      await new Promise((r) => setTimeout(r, 1500))
      setStepResults({ step1: mockStep1, step2: mockStep2, step3: mockStep3 })
    }
    setStep(1)
  }

  const handleReset = () => {
    setStep(-1)
    setJdText('')
    setStepResults({})
  }

  return (
    <div className="min-h-screen bg-bg">
      <TopCompanionBar />
      <NavBar
        currentStep={step < 1 ? 0 : step - 1}
        onStepClick={(targetStep) => setStep(targetStep)}
      />

      <main className="pt-28 pb-16 px-4 max-w-2xl mx-auto">
        {step === -1 && (
          <div className="animate-fade-in">
            {/* Hero */}
            <div className="text-center mb-10 space-y-3">
              <h1
                className="font-heading text-[52px] font-semibold text-text leading-tight tracking-tight"
                style={{ fontSize: '52px' }}
              >
                找到你的路
              </h1>
              <p className="text-text-muted text-lg">
                不是每份工作都适合你，但你值得找到那一份。
              </p>
            </div>

            {/* Input */}
            <InputCard
              value={jdText}
              onChange={setJdText}
              onSubmit={handleSubmit}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

          </div>
        )}

        {step === 0 && <LoadingOverlay />}

        {step === 1 && stepResults.step1 && (
          <Step1Result
            data={stepResults.step1}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && stepResults.step2 && (
          <Step2Result
            data={stepResults.step2}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && stepResults.step3 && (
          <Step3Result data={stepResults.step3} />
        )}

        {/* 重新来过 */}
        {step >= 1 && (
          <div className="mt-10 text-center">
            <button
              onClick={handleReset}
              className="text-sm text-text-muted/50 hover:text-text-muted transition-colors cursor-pointer underline underline-offset-4"
            >
              重新解读一份JD
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
