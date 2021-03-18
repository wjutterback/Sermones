Certificates folder has key/cer(.pem) - this is a method to use a self-signed certificate to enable HTTPS during dev. If this works we won't have to become our own Certificate Authority, but if we do - I've created a CA for our project which will then have to be installed in our browsers. This is "putting the cart before the horse", because we are not at that step.

projectCA.key/.pem is a method to become our own Certificate Authority
TODO: https://help.ivanti.com/ap/help/en_US/fd/4.4/Content/FileDirector/Admin/3_Clients/Install_Root_Certificate_on_Windows.htm

//https://ourcodeworld.com/articles/read/343/how-to-create-required-pem-certificates-for-https-connection-in-node-web-server

we won't be needing these just yet, but as HTTPS is required for https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia we will eventually

key/cert have been created (w/o CA) - CA/key has been created as well.
