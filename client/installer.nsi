!define ZIP2EXE_COMPRESSOR_ZLIB
!define ZIP2EXE_INSTALLDIR "C:\stafftronix-uploader"
!define ZIP2EXE_NAME "Stafftronix Uploader"
!define ZIP2EXE_OUTFILE "stafftronix-uploader.exe"

!include "${NSISDIR}\Contrib\zip2exe\Base.nsh"
!include "${NSISDIR}\Contrib\zip2exe\Modern.nsh"

!insertmacro SECTION_BEGIN
File "dist\upload.zip"
nsExec::Exec "setx PATH=%PATH%;C:\stafftronix-uploader"
!insertmacro SECTION_END