'use babel';

DOMTokenList.prototype.toArray =
NodeList.prototype.toArray =
HTMLCollection.prototype.toArray = function() {
    return Array.prototype.slice.call(this);
}

import TreeViewClipboardView from './tree-view-clipboard-view';
import { CompositeDisposable } from 'atom';

import * as childProcess from 'child_process';

export default {

    treeViewClipboardView: null,
    subscriptions: null,
    packagePath: atom.configDirPath+'\\packages\\tree-view-clipboard',
    paths: function(bool) {
        var dirs = document.querySelectorAll('[is="tree-view-directory"].selected').toArray();
        var files = document.querySelectorAll('[is="tree-view-file"].selected').toArray();
        if (bool) files = files.map((file) => file.closest('[is="tree-view-directory"]'));
        var selected = dirs.concat(files);
        return selected.map((item) => item.querySelector('.name').dataset.path.trim()).join(' ').trim();
    },
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
    },

    copy(e) {
        e.preventDefault();
        console.log('Copying folder/file(s)!');

        var copyPath = this.packagePath+'\\cli\\copy';
        var command;
        switch(this.platform) {
            case 'win32':
                copyPath += '\\win32';
                command = copyPath+'\\copy.cmd '+copyPath+'\\copy ';
                break;
        }

        if (command)
            this.execute(command + this.paths(), 'Finished copying folder/file(s)!');
    },

    cut(e) {
        e.preventDefault();
        console.log('Cutting folder/file(s)!');

        var cutPath = this.packagePath+'\\cli\\cut';
        var command;
        switch(this.platform) {
            case 'win32':
                cutPath += '\\win32';
                command = cutPath+'\\cut.cmd '+cutPath+'\\cut ';
                break;
        }

        if (command)
            this.execute(command + this.paths(), 'Finished cutting folder/file(s)!');
    },

    paste(e) {
        e.preventDefault();
        console.log('Pasting folder/file(s)!');

        var pastePath = this.packagePath+'\\cli\\paste';
        var command;
        switch(this.platform) {
            case 'win32':
                pastePath += '\\win32';
                command = pastePath+'\\paste.cmd '+pastePath+'\\paste ';
                break;
        }

        if (command)
            this.execute(command + this.paths(true), 'Finished pasting folder/file(s)!');
    },

    execute(command, msg) {
        return new Promise((resolve) => {
            childProcess.exec(command, function(err, stdout, stderr) {
                if (err) console.log(err);
                else console.log(stdout, stderr, '\n'+msg);

                resolve(...arguments);
            });
        });
    }

};
