import { useEffect, useState } from 'react'
import TopCompanionBar from './components/TopCompanionBar'
import NavBar from './components/NavBar'
import InputCard from './components/InputCard'
import LoadingOverlay from './components/LoadingOverlay'
import Step1Result from './components/Step1Result'
import Step2Result from './components/Step2Result'
import Step3Result from './components/Step3Result'
import { analyzeItem, analyzeJD, getLatestResume, saveResume } from './services/difyApi'

export default function App() {
  // useState：React状态，变量变，页面自动刷新
  const itemId = new URLSearchParams(window.location.search).get('itemId')
  const [jdText, setJdText] = useState('')
  const [step, setStep] = useState(() => (
    itemId && /^\d+$/.test(itemId) ? 0 : -1
  )) // -1输入页，0加载中，1/2/3结果阶段
  const [stepResults, setStepResults] = useState({})
  const [analysisError, setAnalysisError] = useState('')
  const [resumeId, setResumeId] = useState(null)
  const [resumeName, setResumeName] = useState('')
  const [resumeContent, setResumeContent] = useState('')
  const [resumeStatus, setResumeStatus] = useState('')

  useEffect(() => {
    getLatestResume()
      .then((resume) => {
        if (!resume) return
        setResumeId(resume.id)
        setResumeName(resume.name)
        setResumeContent(resume.content)
      })
      .catch(() => setResumeStatus('简历读取失败'))
  }, [])

  // 页面加载后自动分析
  useEffect(() => {
    if (!itemId || !/^\d+$/.test(itemId)) return

    analyzeItem(itemId)
      .then((outputs) => {
        setStepResults({
          step1: outputs,
          step2: outputs.step2,
          step3: outputs.step3,
        })
        setStep(1)
      })
      .catch((error) => {
        setAnalysisError(error.message || '分析失败，请检查后端服务')
      })
  }, [itemId])

  const handleSubmit = async () => {
    if (!jdText.trim()) return
    setStep(0) // 状态切到 加载中
    setAnalysisError('')
    try {
      const outputs = await analyzeJD(jdText, resumeId)
      setStepResults({
        step1: outputs,
        step2: outputs.step2,
        step3: outputs.step3,
      })
    } catch (err) {
      setAnalysisError(err.message || '分析失败，请检查后端服务')
      return
    }
    setStep(1)
  }

  const handleSaveResume = async () => {
    setResumeStatus('保存中…')
    try {
      const resume = await saveResume(resumeName, resumeContent)
      setResumeId(resume.id)
      setResumeName(resume.name)
      setResumeContent(resume.content)
      setResumeStatus('已保存')
    } catch (error) {
      setResumeStatus(error.message || '保存失败')
    }
  }

  const handleReset = () => {
    setStep(-1)
    setJdText('')
    setStepResults({})
    setAnalysisError('')
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
              resumeName={resumeName}
              resumeContent={resumeContent}
              onResumeNameChange={setResumeName}
              onResumeContentChange={setResumeContent}
              onSaveResume={handleSaveResume}
              resumeStatus={resumeId ? `已读取版本 #${resumeId}，${resumeStatus}` : resumeStatus}
            />

          </div>
        )}

        {step === 0 && !analysisError && <LoadingOverlay />}

        {step === 0 && analysisError && (
          <div className="pt-24 text-center animate-fade-in">
            <p className="text-red mb-6">{analysisError}</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-btn bg-text text-bg font-medium cursor-pointer"
            >
              返回首页
            </button>
          </div>
        )}

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
