import { useRef } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import { Box, CircularProgress } from '@mui/material'
import * as monaco from 'monaco-editor'

interface CodeEditorProps {
  value: string
  onChange?: (value: string | undefined) => void
  language?: string
  readOnly?: boolean
  height?: string | number
  theme?: 'vs-dark' | 'light'
}

export default function CodeEditor({
  value,
  onChange,
  language = 'typescript',
  readOnly = false,
  height = '600px',
  theme = 'vs-dark',
}: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor

    // エディタのキーバインディング設定
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Ctrl+S / Cmd+S で保存（将来実装）
      console.log('保存コマンド')
    })
  }

  const handleEditorChange = (value: string | undefined) => {
    onChange?.(value)
  }

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={theme}
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
        loading={
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <CircularProgress />
          </Box>
        }
      />
    </Box>
  )
}
