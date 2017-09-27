'use strict';

function VesselEditController($scope, $controller, $location, $http,
  formula, formulaAutoCompleteService, fileFunnelService, NpolarApiSecurity,
  npdcAppConfig, Vessel) {
  'ngInject';

  let self = this;
  $controller('NpolarEditController', { $scope: $scope });
  $scope.resource = Vessel;

    self.initFormula = () => {
      $scope.formula = formula.getInstance({
      schema: '//api.npolar.no/schema/vessel-1',
      //schema: 'edit/vessel-1.json',
      form: 'edit/formula.json',
      //language: 'edit/translation.json',
      templates: npdcAppConfig.formula.templates,
      languages: npdcAppConfig.formula.languages
    });

    self.base = NpolarApiSecurity.canonicalUri($scope.resource.path);

    self.fileUri = self.base+$location.path().replace('/edit', '/_file');

    // @todo Fix indexing of (currently tokenized): 'owners.name', 'owners.from', 'owners.location'
    self.autocomplete = ['harbours', 'type', 'links.type', 'shipwrecked_location', 'built_where'];

    self.fromHashi = (h) => {
      let href = h.url;
      let filename = h.filename;
      let type = h.content_type;
      let size = h.file_size;
      return  { href, filename, type, size };
    };

    self.toHashi = (f) => {
      let url = f.href;
      let filename = f.filename;
      return { url, filename, content_type: f.type, file_size: f.size };
    };

    formulaAutoCompleteService.autocompleteFacets(self.autocomplete, $scope.resource, $scope.formula);

    fileFunnelService.fileUploader({
      match(field) {
        return field.id === "files";
      },
      server: `${self.base}/:id/_file`,
      multiple: true,
      restricted: false,
      fromHashi: self.fromHashi,
      toHashi: self.toHashi,
      fields: []
    }, $scope.formula);

    self.imagesNotReferenced = (candidates, images) => {
      return candidates.filter(f => {
        let found = images.find(img => img.href === f.href);
        // Return false if found / return true if NOT found (ie. found is undefined)
        return (found === undefined);
      });
    };

    self.injectImagesFromFiles = (imagesNotReferenced) => {
      let v = $scope.formula.getModel();

      if (!v.images) {
        v.images = [];
      }
      imagesNotReferenced.forEach(f => {
        // id could make the href a IRI (e.g. "idræt")
        let href = f.href;
        let filename = f.filename;
        v.images.push({ href, filename });
      });
      $scope.formula.setModel(v);
      console.log('f2 Injected images from files');
    };

     // Inject metadata from _file service ("files" and "images")
    self.injectFileAndImageMetadata = (r) => { // r is $http.get response
      if (r && r.data && r.data.files) {

        // Get file metadata and map from Hashi
        // self.setHashiFiles(r.data.files);
        let files = r.data.files.map(f => self.fromHashi(f));
        if (files) {

          let v = $scope.formula.getModel();
          console.log('files');
          if (v.files !== files) {
            v.files = files;
            $scope.formula.setModel(v);
            console.log('f1 Injected files from _file service', files);
          }

          // Find image files
          let uploadedImageFiles = files.filter(f => (/^image\//).test(f.type));
          console.log('Uploaded images', uploadedImageFiles);

          if (uploadedImageFiles) {
            // Check if any uploaded image file is not referenced in "images"
            let imagesNotReferenced = self.imagesNotReferenced(uploadedImageFiles, v.images);
            console.log('Not referenced', imagesNotReferenced);
            if (imagesNotReferenced && imagesNotReferenced.length > 0) {
              self.injectImagesFromFiles(imagesNotReferenced);
            } else {
              console.log('All uploaded images are referenced');
            }
          }
          // @todo Remove or warn if images points to missing resources?

        }

      }
    };

    // Save on upload
    if (!(/new/).test($location.path())) {
      $scope.$on('npdc-filefunnel-upload-completed', (event, yetAnotherFileListFormat) => {
        $http.get(self.fileUri).then(self.injectFileAndImageMetadata);
      });
    }
  };

  if (!$scope.formula) {
    // edit (or new) action
    self.initFormula();

    $scope.edit().$promise.then(v => {
      // If any uploaded files: Join in files from _file service; inject image metadata if missing
      $http.get(self.fileUri).then(self.injectFileAndImageMetadata);
    });
  }
}

module.exports = VesselEditController;
