'use babel';

DOMTokenList.prototype.toArray =
NodeList.prototype.toArray =
HTMLCollection.prototype.toArray = function() {
    return Array.prototype.slice.call(this);
}

import TreeViewClipboardView from './tree-view-clipboard-view';
import { CompositeDisposable, TreeView, Directory, File } from 'atom';

import * as childProcess from 'child_process';

export default {

    treeViewClipboardView: null,
    subscriptions: null,
    packagePath: atom.packages.resolvePackagePath('tree-view-clipboard'),
    platform: require('os').platform(),

    activate(state) {
        this.treeViewClipboardView = new TreeViewClipboardView(state.treeViewClipboardViewState);

        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'tree-view-clipboard:copy': (e) => this.copy(e)
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'tree-view-clipboard:cut': (e) => this.cut(e)
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'tree-view-clipboard:paste': (e) => this.paste(e)
        }));

        // cut indicator
        // this.cutCheck(true);
        // window.addEventListener('focus', () => this.cutCheck(true));
        //
        // document.addEventListener('click', (e) => {
        //     if (e.target) {
        //         var item;
        //         if (
        //             e.target.matches('.icon-file-directory') ||
        //             e.target.matches('.header.list-item') ||
        //             e.target.matches('.header .name')
        //         ) item = e.target.closest('.directory[is="tree-view-directory"]');
        //         else if (e.target.matches('.directory[is="tree-view-directory"]')) item = e.target;
        //
        //         if (item && item.classList.contains('expanded')) this.cutCheck();
        //     }
        // });
        //
        // atom.commands.add('atom-text-editor', 'core:copy', () => this.removeCut());
        // atom.commands.add('atom-text-editor', 'core:cut', () => this.removeCut());
    },

    copy(e) {
        e.preventDefault();
        console.log('Copying folder/file(s)!');
        // this.removeCut();

        var path = this.packagePath+'\\cli\\copy';
        var command;
        switch(this.platform) {
            case 'win32':
                path += '\\win32';
                command = path+'\\copy.cmd '+path+'\\copy ';
                break;
        }

        if (command)
            this.execute(command + this.execPaths(), 'Finished copying folder/file(s)!');
    },

    cut(e) {
        e.preventDefault();
        console.log('Cutting folder/file(s)!');

        // this.removeCut();
        // var selected = this.rows().filter((row) => row.matches('.selected'));
        //     selected.forEach((row) => {
        //         row.classList.add('cut');
        //     });

        var path = this.packagePath+'\\cli\\cut';
        var command;
        switch(this.platform) {
            case 'win32':
                path += '\\win32';
                command = path+'\\cut.cmd '+path+'\\cut ';
                break;
        }

        if (command)
            this.execute(command + this.execPaths(), 'Finished cutting folder/file(s)!').then((res) => {
                // if (!res.success)
                //     selected.forEach((row) => {
                //         row.classList.remove('cut');
                //     });
                // else
                //     window.localStorage.setItem('tree-view-clipboard:cutPaths', JSON.stringify(
                //         this.paths()
                //     ));
            });
    },

    // cutCheck(override = false) {
    //     console.log('Checking for cut folder/file(s)!');
    //     this.removeCut();
    //
    //     var applyIndicator = function(cut) {
    //         cut.forEach((path) => {
    //             var title = document.querySelector('[data-path="'+path.replace(/\\/g, '\\\\')+'"]');
    //             if (title) title.closest('[is="tree-view-file"], [is="tree-view-directory"]').classList.add('cut');
    //         });
    //     };
    //
    //     if (override) {
    //         var path = this.packagePath+'\\cli\\cut-check';
    //         var command;
    //         switch(this.platform) {
    //             case 'win32':
    //                 path += '\\win32';
    //                 command = path+'\\check.cmd '+path+'\\check ';
    //                 break;
    //         }
    //
    //         if (command)
    //             this.execute(command, 'Finished checking for cut folder/file(s)!').then((res) => {
    //                 if (res.success) {
    //                     var cut = res.stdout.length ? res.stdout.split('\n').filter((value) => value.length).map((oath) => oath.replace(/[\t\r\n]/g, '')) : [];
    //                     applyIndicator(cut);
    //                     window.localStorage.setItem('tree-view-clipboard:cutPaths', JSON.stringify(cut));
    //                 }
    //             });
    //     } else {
    //         var cut = JSON.parse(window.localStorage.getItem('tree-view-clipboard:cutPaths'));
    //         applyIndicator(cut);
    //     }
    // },

    // removeCut() {
    //     this.rows().forEach((row) => {
    //         row.classList.remove('cut');
    //     });
    // }

    paste(e) {
        e.preventDefault();
        console.log('Pasting folder/file(s)!');
        // this.removeCut();

        var path = this.packagePath+'\\cli\\paste';
        var command;
        switch(this.platform) {
            case 'win32':
                path += '\\win32';
                command = path+'\\paste.cmd '+path+'\\paste ';
                break;
        }

        if (command)
            this.execute(command + this.execPaths(true), 'Finished pasting folder/file(s)!');
    },

    execute(command, msg) {
        return new Promise((resolve) => {
            childProcess.exec(command, function(err, stdout, stderr) {
                if (err) console.log(err);
                else console.log(stdout, '\n'+msg);

                resolve({
                    success: !err,
                    error: err,
                    stdout: stdout,
                    stderr: stderr
                });
            });
        });
    },

    rows() {
        var directories = document.querySelectorAll('[is="tree-view-directory"]').toArray(),
            files = document.querySelectorAll('[is="tree-view-file"]').toArray();
        return directories.concat(files);
    },

    paths(bool) {
        var rows = this.rows().filter((item) => item.matches('.selected'));
        var selected = rows.map((row) => bool && row.matches('[is="tree-view-file"]') ? row.closest('[is="tree-view-directory"]') : row );
        return selected.map((row) => '"'+(row.matches('[is="tree-view-file"]') ? row.file.path : row.directory.path)+'"' );
    },

    execPaths() {
        return this.paths().join(' ').trim();
    },

};
