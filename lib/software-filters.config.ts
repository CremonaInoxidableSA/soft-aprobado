import { SoftwareFiltersConfig } from './types';

// Configuración de filtros de software
// Este archivo permite personalizar qué software se excluye y cómo se normalizan los nombres

export const SOFTWARE_FILTERS: SoftwareFiltersConfig = {
  // Patrones de software a excluir completamente
  exclude: [
    /^KB\d+/i,                                    // Windows KB updates (KB123456)
    /^Update for Windows/i,                       // Actualizaciones de Windows
    /^Security Update for/i,                      // Parches de seguridad
    /^Hotfix for/i,                              // Hotfixes
    /^Microsoft Visual C\+\+ \d+ Redistributable/i, // Redistributables de C++
    /^Microsoft \.NET/i,                          // .NET Framework/Core/Runtime
    /^\.NET Framework/i,
    /^\.NET Core/i,
    /^\.NET Runtime/i,
    /^Microsoft Edge Update/i,                    // Actualizaciones de Edge
    /^Microsoft Edge WebView/i,
    /^Windows Software Development Kit/i,         // SDKs
    /^Windows Driver Package/i,                   // Drivers
    /^Intel\(R\) Processor Graphics/i,            // Drivers Intel
    /^Intel\(R\) Management Engine/i,
    /^Realtek High Definition Audio/i,            // Drivers Realtek
    /^Microsoft Office \d+ Click-to-Run/i,        // Componentes internos de Office
    /^MSXML \d+/i,                               // MSXML
    /^vcredist/i,                                // Redistributables
    /^DirectX/i,                                 // DirectX
  ],
  
  // Patrones para normalizar nombres de software
  normalize: [
    // Autodesk
    { pattern: /^(Autodesk AutoCAD)(?:\s+\d{4}|\s+-\s+\w+|\s+\(.+\))?.*$/i, replacement: '$1' },
    { pattern: /^(Autodesk Mechanical)(?:\s+\d{4}|\s+-\s+\w+|\s+\(.+\))?.*$/i, replacement: '$1' },
    { pattern: /^(Autodesk Inventor)(?:\s+\d{4}|\s+-\s+\w+|\s+\(.+\))?.*$/i, replacement: '$1' },
    { pattern: /^(Autodesk Revit)(?:\s+\d{4}|\s+-\s+\w+|\s+\(.+\))?.*$/i, replacement: '$1' },
    { pattern: /^(Autodesk 3ds Max)(?:\s+\d{4}|\s+-\s+\w+|\s+\(.+\))?.*$/i, replacement: '$1' },
    { pattern: /^(Autodesk Maya)(?:\s+\d{4}|\s+-\s+\w+|\s+\(.+\))?.*$/i, replacement: '$1' },
    
    // AutoCAD genérico
    { pattern: /^(AutoCAD)(?:\s+\d{4}|\s+-\s+\w+|\s+\(.+\))?.*$/i, replacement: '$1' },
    
    // Microsoft Office
    { pattern: /^(Microsoft Office Professional Plus|Microsoft Office Standard)(?:\s+\d{4})?.*$/i, replacement: 'Microsoft Office' },
    { pattern: /^(Microsoft 365).*$/i, replacement: '$1' },
    { pattern: /^(Microsoft Excel).*$/i, replacement: '$1' },
    { pattern: /^(Microsoft Word).*$/i, replacement: '$1' },
    { pattern: /^(Microsoft PowerPoint).*$/i, replacement: '$1' },
    { pattern: /^(Microsoft Access).*$/i, replacement: '$1' },
    { pattern: /^(Microsoft Outlook).*$/i, replacement: '$1' },
    
    // Adobe
    { pattern: /^(Adobe Acrobat)(?:\s+DC|\s+\d+|\s+Reader|\s+Pro)?.*$/i, replacement: '$1' },
    { pattern: /^(Adobe Photoshop)(?:\s+CC|\s+\d+)?.*$/i, replacement: '$1' },
    { pattern: /^(Adobe Illustrator)(?:\s+CC|\s+\d+)?.*$/i, replacement: '$1' },
    { pattern: /^(Adobe InDesign)(?:\s+CC|\s+\d+)?.*$/i, replacement: '$1' },
    { pattern: /^(Adobe Premiere Pro)(?:\s+CC|\s+\d+)?.*$/i, replacement: '$1' },
    
    // Navegadores
    { pattern: /^(Google Chrome).*$/i, replacement: '$1' },
    { pattern: /^(Mozilla Firefox).*$/i, replacement: '$1' },
    { pattern: /^(Microsoft Edge)(?!\s+Update|\s+WebView).*$/i, replacement: '$1' },
    
    // Compresores
    { pattern: /^(7-Zip).*$/i, replacement: '$1' },
    { pattern: /^(WinRAR).*$/i, replacement: '$1' },
    { pattern: /^(WinZip).*$/i, replacement: '$1' },
    
    // Comunicación
    { pattern: /^(TeamViewer).*$/i, replacement: '$1' },
    { pattern: /^(Zoom).*$/i, replacement: '$1' },
    { pattern: /^(Microsoft Teams).*$/i, replacement: '$1' },
    { pattern: /^(Slack).*$/i, replacement: '$1' },
    { pattern: /^(Skype).*$/i, replacement: '$1' },
    
    // Desarrollo
    { pattern: /^(Python)(?:\s+\d+\.\d+)?.*$/i, replacement: '$1' },
    { pattern: /^(Java)(?:\s+\d+|\s+\(TM\)|\s+SE)?.*$/i, replacement: '$1' },
    { pattern: /^(Node\.js).*$/i, replacement: '$1' },
    { pattern: /^(Git)(?:\s+version)?.*$/i, replacement: '$1' },
    { pattern: /^(Visual Studio Code).*$/i, replacement: '$1' },
    { pattern: /^(Visual Studio)(?:\s+\d{4}|\s+Community|\s+Professional)?.*$/i, replacement: '$1' },
    
    // Antivirus y seguridad
    { pattern: /^(ESET).*$/i, replacement: '$1' },
    { pattern: /^(Kaspersky).*$/i, replacement: '$1' },
    { pattern: /^(Norton).*$/i, replacement: '$1' },
    { pattern: /^(Avast).*$/i, replacement: '$1' },
    { pattern: /^(AVG).*$/i, replacement: '$1' },
    
    // Otros
    { pattern: /^(VLC media player).*$/i, replacement: '$1' },
    { pattern: /^(CCleaner).*$/i, replacement: '$1' },
    { pattern: /^(Notepad\+\+).*$/i, replacement: '$1' },
  ]
};
