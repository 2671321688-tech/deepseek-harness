using System;
using System.IO;
using System.Text;
using System.Diagnostics;
using System.Threading;
using System.Windows.Forms;
using System.Runtime.InteropServices;

static class Program
{
    [DllImport("user32.dll")]
    static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll")]
    static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
    delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    static bool FocusExistingWindow()
    {
        IntPtr targetHwnd = IntPtr.Zero;
        EnumWindows((hWnd, lParam) =>
        {
            if (IsWindowVisible(hWnd))
            {
                StringBuilder sb = new StringBuilder(512);
                GetWindowText(hWnd, sb, 512);
                string title = sb.ToString();
                if (title.Contains("DeepSeek Harness") || title.Contains("DSH"))
                {
                    targetHwnd = hWnd;
                    return false;
                }
            }
            return true;
        }, IntPtr.Zero);

        if (targetHwnd != IntPtr.Zero)
        {
            ShowWindow(targetHwnd, 9); // SW_RESTORE
            SetForegroundWindow(targetHwnd);
            return true;
        }
        return false;
    }

    [STAThread]
    static void Main(string[] args)
    {
        bool createdNew;
        using (Mutex mutex = new Mutex(true, @"Local\DeepSeekHarnessLauncherMutex", out createdNew))
        {
            if (!createdNew)
            {
                if (!FocusExistingWindow())
                {
                    MessageBox.Show("DeepSeek Harness 正在启动中，请稍候...", "DeepSeek Harness", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                return;
            }

            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
                if (!File.Exists(Path.Combine(baseDir, @"apps\desktop\scripts\dev.ts")))
                {
                    baseDir = @"D:\Desktop\claude\deepseek-harness";
                }
                string appDir = Path.Combine(baseDir, @"apps\desktop");
                string devScript = Path.Combine(appDir, @"scripts\dev.ts");
                string tsxCli = Path.Combine(baseDir, @"node_modules\tsx\dist\cli.mjs");

                string nodePath = @"C:\Program Files\nodejs\node.exe";
                if (!File.Exists(nodePath))
                {
                    string pathEnv = Environment.GetEnvironmentVariable("PATH") ?? "";
                    foreach (string dir in pathEnv.Split(Path.PathSeparator))
                    {
                        string candidate = Path.Combine(dir.Trim(), "node.exe");
                        if (File.Exists(candidate))
                        {
                            nodePath = candidate;
                            break;
                        }
                    }
                }

                if (!File.Exists(nodePath))
                {
                    MessageBox.Show("未找到 Node.js 可执行文件，请检查安装路径。", "DeepSeek Harness 错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                if (!File.Exists(devScript) || !File.Exists(tsxCli))
                {
                    MessageBox.Show("未找到 dev.ts 或 tsx CLI：\n" + devScript, "DeepSeek Harness 错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = nodePath;
                psi.Arguments = string.Format("\"{0}\" \"{1}\" --skip-build", tsxCli, devScript);
                psi.WorkingDirectory = appDir;
                psi.UseShellExecute = false;
                psi.CreateNoWindow = true;
                psi.WindowStyle = ProcessWindowStyle.Hidden;

                psi.EnvironmentVariables["DSH_DESKTOP_OPEN_DEVTOOLS"] = "0";
                psi.EnvironmentVariables["ELECTRON_ENABLE_LOGGING"] = "0";

                if (Environment.GetEnvironmentVariable("DSH_RETAIN_AMBIENT_API_KEY") != "1")
                {
                    if (psi.EnvironmentVariables.ContainsKey("DEEPSEEK_API_KEY"))
                    {
                        psi.EnvironmentVariables.Remove("DEEPSEEK_API_KEY");
                    }
                }

                Process proc = Process.Start(psi);
                if (proc != null)
                {
                    proc.WaitForExit();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("启动 DeepSeek Harness 失败：\n" + ex.Message, "DeepSeek Harness 错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
