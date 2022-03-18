using System;
using System.IO;
using System.Windows.Forms;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Text.RegularExpressions;

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
                    if (isDir) {
                        PasteDirectory(source, target, cut);
                    } else {
                        List<int> copiesList = new List<int>();

                        string [] files = Directory.GetFiles(target);
                        foreach(string file in files) {
                            Match m = Regex.Match(Path.GetFileName(file), @".*\s-\sCopy(?:\s\(([0-9]+)\))?\..*$");
                            if (m.Success) {
                                if (m.Groups.Count > 1)  {
                                    if (!String.IsNullOrEmpty(m.Groups[1].Value))
                                        copiesList.Add(Int32.Parse(m.Groups[1].Value));
                                    else copiesList.Add(1);
                                }
                            }
                        }
                        copiesList.Sort();

                        int copies = 0;

                        if (copiesList.Count > 0) {
                        	int last = copiesList[copiesList.Count - 1],
                        		missing = last + 1;

                            int index = 0;
                        	foreach(int copy in copiesList) {
                        		if (index > 0 && copiesList[index - 1] != copiesList[index] - 1) {
                        			missing = copiesList[index] - 1;
                        			break;
                        		}
                                index++;
                        	}

                            copies = missing;
                        }

                        string dest = Path.Combine(target, Path.GetFileName(source));

                        if (File.Exists(dest)) {
                            if (Convert.ToBoolean(copies))
                                File.Copy(source, Path.Combine(target, Path.GetFileNameWithoutExtension(source) + " - Copy ("+copies+")" + Path.GetExtension(source)));
                            else File.Copy(source, Path.Combine(target, Path.GetFileNameWithoutExtension(source) + " - Copy" + Path.GetExtension(source)));
                        } else File.Copy(source, dest);

                        if (cut) {
                            File.Delete(source);
                            Clipboard.Clear();
                        }

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
