import { SoftwareFiltersConfig } from "./types";
export const SOFTWARE_FILTERS: SoftwareFiltersConfig = {
  exclude: [
    // Inician con
    /^AppServ 8.4.0/i,
    /^Asistente para actualización a Windows/i,
    /^Asistente para la instalación de Windows/i,
    /^AutoCAD 2022 Language Pack/i,
    /^DirectX/i,
    /^Hotfix for/i,
    /^Ink\.Handwriting/i,
    /^KB\d+/i,
    /^LocalServiceComponents/i,
    /^Microsoft/i,
    /^MSXML \d+/i,
    /^mspaint-/,
    /^mstsc-/,
    /^NetmanageServer/i,
    /^Open ModScan/i,
    /^Paquete /,
    /^Realtek High Definition Audio/i,
    /^Security Update for/i,
    /^Update for Windows/i,
    /^USB Link Cable/i,
    /^User Management Component/i,
    /^vcredist/i,
    /^Widgets/,
    /^WinApp/,
    /^Windows App/,
    /^Windows Driver Package/i,
    /^Windows Package/,
    /^Windows Software Development Kit/i,
    /^Windows Web/,
    /^WindowsApp/,
    /^\{.*\}$/,

    // Contienen
    /.*@BIOS.*/i,
    /.*\.NET.*/i,
    /.*ACA &#38; MEP 2022 Object Enabler.*/i,
    /.*Adobe Refresh Manager.*/i,
    /.*AIDA64 Extreme v7.50.*/i,
    /.*AMD.*/i,
    /.*APP Center.*/i,
    /.*Aplicaciones destacadas de Autodesk.*/i,
    /.*AppUp\.IntelGraphicsExperience.*/i,
    /.*AppUp\.ThunderboltControlCenter.*/i,
    /.*Asistente para actualización.*/i,
    /.*AutoCAD Mechanical 2022 - English.*/i,
    /.*AutoCAD Open in Desktop.*/i,
    /.*Autodesk App Manager.*/i,
    /.*Autodesk AutoCAD Mechanical 2022 - English.*/i,
    /.*Autodesk CER./i,
    /.*Autodesk Desktop Connect Service.*/i,
    /.*Autodesk DWG TrueView 2025.*/i,
    /.*Autodesk Guided Tutorial Plugin.*/i,
    /.*Autodesk Material Library.*/i,
    /.*Autodesk Network License Manager.*/i,
    /.*AWB Host.*/i,
    /.*Branding64.*/i,
    /.*Click-to-Run.*/i,
    /.*Cortana.*/i,
    /.*Dolby.*/i,
    /.*Driver.*/i,
    /.*Edge.*/i,
    /.*EPLAN License.*/i,
    /.*Fingerprint.*/i,
    /.*Game.*/i,
    /.*GLPI.*/i,
    /.*Glance by Mirametrix.*/i,
    /.*GPIO.*/i,
    /.*Guardar en la versión web y para dispositivos móviles de Autodesk.*/i,
    /.*HPDXP.*/i,
    /.*HPLJ.*/i,
    /.*Intel.*/i,
    /.*Internet Explorer.*/i,
    /.*I\.V\.A\..*/i,
    /.*JDK.*/i,
    /.*Lenovo.*/i,
    /.*License Manager.*/i,
    /.*Local Experience Pack.*/i,
    /.*Microsoft 365 Copilot.*/i,
    /.*Microsoft Office ActionsServer.*/i,
    /.*microsoft windowscommunicationsapps.*/i,
    /.*NBX-MS/i,
    /.*NVIDIA.*/i,
    /.*OfficePushNotificationsUtility.*/i,
    /.*OneNote.*/i,
    /.*Realtek.*/i,
    /.*Runtime.*/i,
    /.*Shell.*/i,
    /.*SIMATIC.*/i,
    /.*SnippingTool.*/i,
    /.*Speech Pack.*/i,
    /.*Synaptics TouchPad Control Panel.*/i,
    /.*TIA Administrator.*/i,
    /.*TIA Portal Project Server Single.*/i,
    /.*Thinkpad.*/i,
    /.*TrackPoint.*/i,
    /.*Update.*/i,
    /.*Upgrade.*/i,
    /.*X-Mouse Button Control 2.20.5.*/i,
    /.*Xbox.*/i,
    /\bHP\b/i,
    /.*hpStatusAlerts.*/i,

    // Nombre
    /^Blackmagic RAW Common Components$/i,
    /^Comprobación de estado de PC Windows$/i,
    /^Copilot$/i,
    /^Core$/i,
    /^CoreRepository$/i,
    /^CrystalDiskInfo SQL Diagnostics$/i,
    /^Dynamic Application Loader Host Interface Service$/i,
    /^DriverManager x64$/i,
    /^E0469640\.SmartAppearance$/i,
    /^ETWEventCollector$/i,
    /^FiberLaserManagement$/i,
    /^hppLaserJetService$/i,
    /^NCM GPRS 64/i,
    /^LWE$/i,
    /^ShellEx Package$/i,
    /^SeCon$/i,
    /^Teams Machine-Wide Installer$/i,
    /^TelemetryConnector$/i,
    /^TJ1 Device Driver$/i,
    /^Uninstall Samsung Printer Software$/i,
    /^中文\(简体\)本地体验包$/i,
    /^惠普优享服务$/i,
    /\bInstaller\b/i,
    /\bWinCC Runtime Advanced Simulator\b/i,
    /^myHP$/i,
  ],

  // Incluir
  include: [
    /^Microsoft PowerAutomateDesktop/i,
    /^Microsoft PowerPoint 2016/i,
    /^Microsoft PowerPoint LTSC - es-es\.proof/i,
    /^Microsoft 365 - es-es/i,
    /^Microsoft Office P/i,
    /^Microsoft OneDrive$/i,
    /^Microsoft Project/i,
    /.*SIMATIC.*17\.0.*/i,
    /.*SIMATIC.*16\.0.*/i,
  ],

  // Normalizar
  normalize: [
    {
      pattern:
        /^(Adobe Acrobat)(?:\s+DC|\s+\d+|\s+Reader|\s+Pro|\s+\(64-bits\))?.*$/i,
      replacement: "$1",
    },
    {
      pattern: /^AutoCAD(?:\s+Mechanical)?(?:\s+2022)?$/i,
      replacement: "AutoDesk AutoCAD 2022",
    },
    { pattern: /^Clipchamp(\.Clipchamp)?$/i, replacement: "Clipchamp" },
    { pattern: /^(draw\.io)\s+.*$/i, replacement: "$1" },
    { pattern: /^(Foxit PDF)\s+.*$/i, replacement: "$1" },
    { pattern: /^(Kaspersky)\s+.*$/i, replacement: "$1" },
    {
      pattern: /^(Autodesk DWG TrueView 2025)\s+.*$/i,
      replacement: "AutoDesk DWG TrueView 2025",
    },

    {
      pattern: /^(Microsoft 365 Apps for business)(?:\s+-\s+\w+-\w+)?$/i,
      replacement: "Microsoft Office 365 (Licencia)",
    },
    {
      pattern:
        /^(Aplicaciones de Microsoft 365 para negocios)(?:\s+-\s+\w+-\w+)?$/i,
      replacement: "Microsoft Office 365 (Licencia)",
    },

    {
      pattern:
        /^(Microsoft Office Profesional Plus 2019)(?:\s+-\s+\w+-\w+(?:\.\w+)?)?$/i,
      replacement: "Microsoft Office 2019",
    },
    {
      pattern:
        /^(Microsoft Office Professional Plus 2019)(?:\s+-\s+\w+-\w+(?:\.\w+)?)?$/i,
      replacement: "Microsoft Office 2019",
    },

    {
      pattern: /^(Microsoft 365 - es-es)(?:\s+-\s+\w+-\w+)?$/i,
      replacement: "Microsoft Office 2016",
    },
    {
      pattern: /^(Microsoft PowerPoint 2016)(?:\s+-\s+\w+-\w+)?$/i,
      replacement: "Microsoft Office 2016",
    },
    {
      pattern:
        /^(Microsoft Office Profesional Plus 2016)(?:\s+-\s+\w+-\w+(?:\.\w+)?)?$/i,
      replacement: "Microsoft Office 2016",
    },
    {
      pattern:
        /^(Microsoft Office Professional Plus 2016)(?:\s+-\s+\w+-\w+(?:\.\w+)?)?$/i,
      replacement: "Microsoft Office 2016",
    },

    {
      pattern: /^(Microsoft PowerPoint LTSC)(?:\s+-\s+\w+-\w+(?:\.\w+)?)?$/i,
      replacement: "Microsoft Office 2016",
    },
    {
      pattern:
        /^(Microsoft Office LTSC Professional Plus 2021 - en-us)(?:\s+-\s+\w+-\w+)?$/i,
      replacement: "Microsoft Office 2021",
    },

    {
      pattern: /^(Microsoft Project Profesional 2016)(?:\s+-\s+\w+-\w+)?$/i,
      replacement: "Project 2016",
    },
    {
      pattern: /^(Microsoft Project Professional 2016)(?:\s+-\s+\w+-\w+)?$/i,
      replacement: "Project 2016",
    },

    {
      pattern:
        /^(Microsoft Project Professional 2021)(?:\s+-\s+\w+-\w+(?:\.\w+)?)?$/i,
      replacement: "Project 2021",
    },
    {
      pattern:
        /^(Microsoft Project Profesional 2021)(?:\s+-\s+\w+-\w+(?:\.\w+)?)?$/i,
      replacement: "Project 2021",
    },
    {
      pattern: /^(Microsoft Project)(?:\s+-\s+\w+-\w+)?$/i,
      replacement: "Project 2021",
    },

    {
      pattern: /^Microsoft PowerAutomateDesktop\s*$/i,
      replacement: "Power Automate",
    },

    { pattern: /^(Python)\s+.*$/i, replacement: "$1" },
    { pattern: /^(PowerToys)\s+.*$/i, replacement: "$1" },
    { pattern: /^(WinRAR)\s+.*$/i, replacement: "$1" },

    { pattern: /^(spacedesk Windows DRIVER)\s+.*$/i, replacement: "$1" },
    { pattern: /^(DaVinci Resolve)\s+.*$/i, replacement: "$1" },
    { pattern: /^(FluidSIM Pneumatics V 4\.2)\s+.*$/i, replacement: "$1" },
    { pattern: /^(Krita)\s+.*$/i, replacement: "$1" },
    { pattern: /^(Mozilla)\s+.*$/i, replacement: "Mozilla Firefox" },

    { pattern: /^(TAP-Windows)\s+.*$/i, replacement: "IXON VPN" },
    { pattern: /.*IXON.*/i, replacement: "IXON VPN" },

    { pattern: /.*Vijeo Designer.*/i, replacement: "Vijeo Designer" },

    { pattern: /.*Spotify.*/i, replacement: "Spotify" },
    { pattern: /.*EPLAN.*2\.9.*/i, replacement: "EPLAN 2.9" },
    { pattern: /.*McAfee.*/i, replacement: "McAfee Security" },
    { pattern: /.*AnyDesk.*/i, replacement: "AnyDesk" },
    { pattern: /.*Inventor.*/i, replacement: "AutoDesk Inventor 2022" },

    { pattern: /.*CX-One.*/i, replacement: "Omron" },
    { pattern: /.*CX-Server.*/i, replacement: "Omron" },
    { pattern: /.*CX Common Tools.*/i, replacement: "Omron" },

    { pattern: /.*SQL.*/i, replacement: "MySQL" },
    { pattern: /.*EPLAN.*/i, replacement: "EPLAN" },
    { pattern: /.*Logi.*/i, replacement: "Logi Options+" },
    { pattern: /.*VLC.*/i, replacement: "VLC Media Player" },
    { pattern: /.*Notepad\+\+.*/i, replacement: "Notepad++" },
    { pattern: /.*OpenOffice.*/i, replacement: "OpenOffice" },
    { pattern: /.*Macrium.*/i, replacement: "Macrium Reflect" },
    { pattern: /.*LibreOffice.*/i, replacement: "LibreOffice" },
    { pattern: /.*DobotStudio.*/i, replacement: "DobotStudio" },
    { pattern: /.*LOGO!.*/i, replacement: "LOGO! Soft Comfort" },
    { pattern: /.*DWG FastView.*/i, replacement: "DWG FastView" },
    { pattern: /.*Malwarebytes.*/i, replacement: "Malwarebytes" },
    { pattern: /.*KUKA.*/i, replacement: "KUKA Engineering Tools" },
    { pattern: /.*OneDrive.*/i, replacement: "Microsoft OneDrive" },
    { pattern: /.*Revo Uninstaller.*/i, replacement: "Revo Uninstaller" },
    { pattern: /.*MediBang Paint Pro.*/i, replacement: "MediBang Paint Pro" },
    {
      pattern: /.*Silicon Laboratories.*/i,
      replacement: "Silicon Laboratories",
    },

    { pattern: /.*CrystalDiskInfo.*/i, replacement: "CrystalDiskInfo" },
    { pattern: /.*CrystalDiskMark.*/i, replacement: "CrystalDiskMark" },

    {
      pattern: /.*Totally Integrated Automation Portal V16.*/i,
      replacement: "Siemens TIA Portal V16",
    },
    {
      pattern: /.*Totally Integrated Automation Portal V17.*/i,
      replacement: "Siemens TIA Portal V17",
    },

    { pattern: /.*SIMATIC.*16.*/i, replacement: "SIMATIC V16" },
    { pattern: /.*SIMATIC.*17.*/i, replacement: "SIMATIC V17" },

    { pattern: /.*TIA.*16.*/i, replacement: "Siemens TIA Portal V16" },
    { pattern: /.*TIA.*17.*/i, replacement: "Siemens TIA Portal V17" },

    { pattern: /.*HMIRTM.*16.*/i, replacement: "Siemens HMIRTM V16" },
    { pattern: /.*HMIRTM.*17.*/i, replacement: "Siemens HMIRTM V17" },

    { pattern: /.*16.*OPCUA.*/i, replacement: "Siemens OPCUA V16" },
    { pattern: /.*17.*OPCUA.*/i, replacement: "Siemens OPCUA V17" },
    { pattern: /.*OPC.*/i, replacement: "Siemens OPCUA V16" },
    { pattern: /.*OPC.*/i, replacement: "Siemens OPCUA V17" },

    { pattern: /.*SCADA.*16.*/i, replacement: "Siemens SCADA V16" },
    { pattern: /.*SCADA.*17.*/i, replacement: "Siemens SCADA V17" },

    { pattern: /.*DOPSOFT.*/i, replacement: "ISPSoft" },
    { pattern: /.*DCISOFT.*/i, replacement: "ISPSoft" },
    { pattern: /.*ISPSoft.*/i, replacement: "ISPSoft" },
  ],
};
