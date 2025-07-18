import ToolSharePage from '@/components/ToolSharePage'
import { toolConfigs } from '@/lib/toolConfigs'

interface Props {
  params: { id: string }
}

export default function UserGuideSharePage({ params }: Props) {
  const config = toolConfigs.workingWithMe

  const renderResults = (data: any) => {
    const { guide } = data

    return (
      <div className="space-y-6">
        {guide.sections.map((section: any, index: number) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-nightfall mb-3">{section.title}</h3>
            <p className="text-gray-700 whitespace-pre-line">{section.content}</p>
          </div>
        ))}
        
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 text-center">
          <p className="text-blue-800">
            This guide helps colleagues work better with this person by understanding their preferences and needs.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ToolSharePage 
      shareId={params.id}
      toolPath="/user-guide"
      toolConfig={{
        title: config.title,
        gradient: 'from-[#30C7C7] to-[#2A74B9]'
      }}
      renderResults={renderResults}
    />
  )
}