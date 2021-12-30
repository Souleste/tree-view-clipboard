using System;
using System.IO;
using System.Windows.Forms;
using System.Collections.Generic;
using System.Collections.Specialized;

namespace TreeViewClipBoardPaste {
    public class App {
        [STAThread]
        static void Main(string[] args) {
            IDataObject data = Clipboard.GetDataObject();
            if (!data.GetDataPresent(DataFormats.FileDrop)) {
                Console.WriteLine("No data was found in the Clipboard.");
                return;
            }

            string[] sources = (string[]) data.GetData(DataFormats.FileDrop);
            MemoryStream stream = (MemoryStream) data.GetData("Preferred DropEffect", true);
            int flag = stream.ReadByte();
            if (flag != 2 && flag != 5) return;
            bool cut = (flag == 2);

            Console.WriteLine("Object was cut? " + cut.ToString());

            foreach (string source in sources) {
                bool isDir = string.IsNullOrEmpty(Path.GetFileName(source)) || Directory.Exists(source);
                foreach (string target in args) {
                    if (isDir) PasteDirectory(source, target, cut);
                    else {
                        string dest = Path.Combine(target, Path.GetFileName(source));
                        if (cut) {
                            if (File.Exists(dest)) File.Delete(dest);
                            File.Move(source, dest);
                            Clipboard.Clear();
                        } else File.Copy(source, dest, true);
                    }
                }
            }
        }

        private static void PasteDirectory(string sourcePath, string targetPath, bool cut) {
            DirectoryInfo source = new DirectoryInfo(sourcePath);

            if (!source.Exists)
                throw new DirectoryNotFoundException("Source directory does not exist or could not be found: " + sourcePath);

            DirectoryInfo target = new DirectoryInfo(Path.Combine(targetPath, source.Name));
            if (cut) {
                if (Directory.Exists(target.FullName)) Directory.Delete(target.FullName, true);
                Directory.Move(sourcePath, target.FullName);
            } else {
                Directory.CreateDirectory(target.FullName);

                FileInfo[] files = source.GetFiles();
                foreach (FileInfo file in files) {
                    File.Copy(Path.Combine(source.FullName, file.Name), Path.Combine(target.FullName, file.Name), true);
                }

                DirectoryInfo[] dirs = source.GetDirectories();
                foreach (DirectoryInfo dir in dirs)
                    PasteDirectory(dir.FullName, target.FullName, false);
            }
        }
    }
}
