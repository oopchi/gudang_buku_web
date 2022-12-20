'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "c6461ca0a7717cd6ce30675dd433f034",
"index.html": "76de738fa380f5a19dacd8f29d65337b",
"/": "76de738fa380f5a19dacd8f29d65337b",
"main.dart.js": "d6b85f6eff97f1062bf1181692b6870b",
"worker.js": "f916974921b8b3d98f9fdfc4b68e5432",
"flutter.js": "f85e6fb278b0fd20c349186fb46ae36d",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "9f0ba2d5e0b437aaafa76d0e3edd1116",
"assets/dotenv": "bfd8e09223a04c64315c7f8591f85284",
"assets/AssetManifest.json": "a26610e7391a6573fb588cf04b48b349",
"assets/NOTICES": "944caa8c1a2d1ccd6540631400b09864",
"assets/FontManifest.json": "7e91fd4792644019100a155166ffdca8",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/shaders/ink_sparkle.frag": "a583cdf11df947b4c3406f71ada4ead2",
"assets/fonts/Metropolis-Light-Italic-400.otf": "2de2a64942ecaedbf0dc68270a8ce3b8",
"assets/fonts/Metropolis-Bold-Italic-700.otf": "15b149fc383c85f27360a5736fa6e50d",
"assets/fonts/Metropolis-SemiBold-600.otf": "2556a4f74e2c523893e6928d6e300f1c",
"assets/fonts/Metropolis-ExtraBold-800.otf": "d7eaa8ab58ec03f16c8d08389711f553",
"assets/fonts/Metropolis-Extra-Light-Italic-400.otf": "414a434d6ad4b388afa68225a7e44597",
"assets/fonts/Metropolis-Black-Italic-900.otf": "ef50aa42a925d3c8a52d0e6828f2c66c",
"assets/fonts/Metropolis-Regular-400.otf": "f7b5e589f88206b4bd5cb1408c5362e6",
"assets/fonts/Metropolis-Italic-400.otf": "763b44257f3ad942e107551bff15b544",
"assets/fonts/Metropolis-Medium-Italic-700.otf": "60eace1cb8db8096bcd15731bd3a35a3",
"assets/fonts/Metropolis-Thin-400.otf": "152ab0324f4452c56f2622dc6262e9b6",
"assets/fonts/Metropolis-Black-900.otf": "de55ae52af85b8952e65d1b546992618",
"assets/fonts/Metropolis-Light-400.otf": "c82170e08b76657553ab939bd28e8515",
"assets/fonts/Metropolis-Extra-Bold-Italic-800.otf": "f1e8fdf108c2af1ebb791f40c1bd1868",
"assets/fonts/Metropolis-ExtraLight-400.otf": "c5ae09393655dab636f6d2e3d222137c",
"assets/fonts/Metropolis-Bold-700.otf": "dea4998b081c6c1133a3b5b08ff2218c",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/fonts/Metropolis-Thin-Italic-400.otf": "a10db35c6f484989bb7bd80b5e06b075",
"assets/fonts/Metropolis-Medium-500.otf": "f4bca87fd0d19e61c27dc96299c75f8c",
"assets/fonts/Metropolis-Semi-Bold-Italic-700.otf": "536778d712a7064c003705580236e03f",
"assets/assets/images/google.png": "4cc226c9f8b9ecb771bbe488af4766c2",
"canvaskit/canvaskit.js": "2bc454a691c631b07a9307ac4ca47797",
"canvaskit/profiling/canvaskit.js": "38164e5a72bdad0faa4ce740c9b8e564",
"canvaskit/profiling/canvaskit.wasm": "95a45378b69e77af5ed2bc72b2209b94",
"canvaskit/canvaskit.wasm": "bf50631470eb967688cca13ee181af62"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
