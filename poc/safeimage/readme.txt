This POC shows that it is possible to display big images with Javascript.

To see it, use your web browser and go to url [current_folder]/index.html

Images are first splitted into many small images with ZoomifyImage
(http://sourceforge.net/projects/zoomifyimage/) like this :

python [path_to_zoomify]/ZoomifyFileProcessor.py image/original_image.jpg

ZoomifyImage create a folder (with name of the image) coming with a file
ImageProperties.xml (define size of image, number of tiles, etc), and several
folders containing all splitted parts.

Then only OpenLayers is used with Zoomify functions that comes directly with it.
