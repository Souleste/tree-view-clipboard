using System;
using System.IO;
using System.Windows.Forms;
using System.Collections.Generic;
using System.Collections.Specialized;

namespace TreeViewClipboardCopy {
    public class App {
        [STAThread]
        static void Main(string[] args) {
            byte[] copyEffect = new byte[] {5, 0, 0, 0};
            MemoryStream dropEffect = new MemoryStream();
            dropEffect.Write(copyEffect, 0, copyEffect.Length);

            DataObject data = new DataObject();

            StringCollection paths = new StringCollection();
            foreach (string path in args)
                paths.Add(
                    System.IO.Path.IsPathRooted(path) ? path :
                    System.IO.Directory.GetCurrentDirectory() + @"\" + path
                );
            data.SetFileDropList(paths);
            data.SetData("Preferred DropEffect", dropEffect);

            Clipboard.Clear();
            Clipboard.SetDataObject(data, true);
        }
    }
}
