/*
Copyright 2015, 2016 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const React = require('react');
const ContentMessages = require('../../ContentMessages');
const dis = require('../../dispatcher');
const filesize = require('filesize');
import { _t } from '../../languageHandler';

module.exports = React.createClass({displayName: 'UploadBar',
    propTypes: {
        room: React.PropTypes.object,
    },

    componentDidMount: function() {
        this.dispatcherRef = dis.register(this.onAction);
        this.mounted = true;
    },

    componentWillUnmount: function() {
        this.mounted = false;
        dis.unregister(this.dispatcherRef);
    },

    onAction: function(payload) {
        switch (payload.action) {
            case 'upload_progress':
            case 'upload_finished':
            case 'upload_failed':
                if (this.mounted) this.forceUpdate();
                break;
        }
    },

    render: function() {
        const uploads = ContentMessages.getCurrentUploads();

        // for testing UI... - also fix up the ContentMessages.getCurrentUploads().length
        // check in RoomView
        //
        // uploads = [{
        //     roomId: this.props.room.roomId,
        //     loaded: 123493,
        //     total: 347534,
        //     fileName: "testing_fooble.jpg",
        // }];

        if (uploads.length == 0) {
            return <div />;
        }

        let upload;
        for (let i = 0; i < uploads.length; ++i) {
            if (uploads[i].roomId == this.props.room.roomId) {
                upload = uploads[i];
                break;
            }
        }
        if (!upload) {
            return <div />;
        }

        const innerProgressStyle = {
            width: ((upload.loaded / (upload.total || 1)) * 100) + '%',
        };
        let uploadedSize = filesize(upload.loaded);
        const totalSize = filesize(upload.total);
        if (uploadedSize.replace(/^.* /, '') === totalSize.replace(/^.* /, '')) {
            uploadedSize = uploadedSize.replace(/ .*/, '');
        }

        // MUST use var name 'count' for pluralization to kick in
        const uploadText = _t("Uploading %(filename)s and %(count)s others", {filename: upload.fileName, count: (uploads.length - 1)});

        return (
            <div className="mx_UploadBar">
                <div className="mx_UploadBar_uploadProgressOuter">
                    <div className="mx_UploadBar_uploadProgressInner" style={innerProgressStyle}></div>
                </div>
                <img className="mx_UploadBar_uploadIcon mx_filterFlipColor" src="img/fileicon.png" width="17" height="22" />
                <img className="mx_UploadBar_uploadCancel mx_filterFlipColor" src="img/cancel.svg" width="18" height="18"
                    onClick={function() { ContentMessages.cancelUpload(upload.promise); }}
                />
                <div className="mx_UploadBar_uploadBytes">
                    { uploadedSize } / { totalSize }
                </div>
                <div className="mx_UploadBar_uploadFilename">{ uploadText }</div>
            </div>
        );
    },
});
