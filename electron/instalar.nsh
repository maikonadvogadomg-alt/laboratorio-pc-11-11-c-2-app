; Antes de instalar/atualizar, fecha sozinho o programa antigo (e tudo o que o terminal dele ligou),
; em vez de parar no meio dizendo que o programa "está sendo usado". Serve para o Mini SK e o Laboratório.
!macro customCheckAppRunning
  nsExec::Exec 'taskkill /F /T /IM "${APP_EXECUTABLE_FILENAME}"'
  Pop $0
  Sleep 1500
!macroend
