import path from "path";
import fs from "fs";

export const readFiles = (_audioPath, _baseUrl, _audioPathRel) => {
    // console.log('_audioPath: ', _audioPath);

    // variables folders
    let _audioFiles = {};
    let entry = "";

    // FOLDERS - get file content of _audioPath
    entry = fs.readdirSync(_audioPath, (err) => {
        if (err) return console.log(err);
    });
    // check for each folder entry in the audioPath
    entry.forEach((folder) => {
        // check if entry is folder. first check for extension
        var ext = path.parse(folder).ext;
        // if file is folder
        if (ext == "" && folder[0] != ".") _audioFiles[folder] = [];
    });

    // FILES - get files from folders, save URL according to baseUrl
    for (let folder in _audioFiles) {
        // console.log('folder', folder.toString())
        // create an URL
        let url = path.join(_audioPath, folder);
        // read entries in the folders
        let entries = fs.readdirSync(url, (err) => {
            if (err) return console.log("Unable to scan directory: " + err);
        });
        // for each entry: if it does not start with . => add to collection
        for (let i in entries) {
            // console.log("entries[i]", entries[i])
            if (!entries[i].startsWith(".")) {
                // _audioFiles[folder][entries[i]] = path.join(_baseUrl, entries[i]);
                _audioFiles[folder].push([
                    entries[i],
                    path.join(`${_audioPathRel}/${folder}`, entries[i]),
                ]);
            }
        }
    }

    // console.log("_audioFiles in readFiles: ", _audioFiles)
    return _audioFiles;
};

export const readAlerts = (_alertsPath, _baseUrl, _serverPath) => {
    // console.log('_audioPath: ', _audioPath);

    // variables folders
    let alerts = {};
    let entry = "";

    // ALERTS - get files from folders, save URL according to baseUrl
    // create an URL
    // let url = path.join(_alertsPath, folder);
    // read entries in the folders
    let entries = fs.readdirSync(_alertsPath, (err) => {
        if (err) return console.log("Unable to scan directory: " + err);
    });

    for (let i in entries) {
        if (!entries[i].startsWith(".")) {
            console.log("  -> alerts: ", entries[i]);
            // grab file name
            let name = entries[i].split(".")[0];
            // push name, file, path to array
            alerts[name] = {
                file: entries[i],
                path: path.join(_serverPath, entries[i]),
            };
        }
    }

    // console.log("_audioFiles in readFiles: ", _audioFiles)
    return alerts;
};
