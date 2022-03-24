using System;
using System.IO;
using System.Windows.Forms;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Text.RegularExpressions;

namespace TreeViewClipBoardCutCheck {
    public class App {
        [STAThread]
        static void Main(string[] args) {
            IDataObject data = Clipboard.GetDataObject();
            if (!data.GetDataPresent(DataFormats.FileDrop)) return;

            string[] sources = (string[]) data.GetData(DataFormats.FileDrop);
            MemoryStream stream = (MemoryStream) data.GetData("Preferred DropEffect", true);
            int flag = stream.ReadByte();
            if (flag != 2) return;

            foreach (string source in sources) Console.WriteLine(source);
        }
    }
}
