document.addEventListener("DOMContentLoaded", function () {
    const wspolrzednePrzycisk = document.getElementById("wspolrzednePrzycisk");
    const rasterPrzycisk = document.getElementById("rasterPrzycisk");
    const puzzlePrzycisk = document.getElementById("puzzlePrzycisk");
	const sprawdzPrzycisk = document.getElementById("sprawdzPrzycisk");
    const wspolrzedne = document.getElementById("wspolrzedne");
    const map2 = document.getElementById("map2");
    const puzzlePole = document.getElementById("puzzlePole");
	
    var img = new Image();

    var center = [52.2, 21.0];
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    var osm = L.tileLayer(osmUrl, {
      maxZoom: 18,
      attribution: osmAttrib
    });
    var map = new L.Map('map', {
      layers: [osm],
      center: new L.LatLng(center[0], center[1]),
      zoom: 7
    });
	
    wspolrzednePrzycisk.addEventListener("click", geolokacja);
    rasterPrzycisk.addEventListener("click", raster);
    puzzlePrzycisk.addEventListener("click", puzzle);
	sprawdzPrzycisk.addEventListener("click", sprawdz);
	
	rasterPrzycisk.disabled = true;
    puzzlePrzycisk.disabled = true;
	sprawdzPrzycisk.disabled = true;
	
function konwertuj_wspolrzedne(szerokosc, dlugosc) {
    function konwertuj(wspolrzedne) {
        const stopnie = Math.floor(wspolrzedne);
        const minuty = Math.floor((wspolrzedne - stopnie) * 60);
        return `${stopnie}° ${minuty}'`;
    }
    const szerokosc_geograficzna = konwertuj(szerokosc);
    const dlugosc_geograficzna = konwertuj(dlugosc);
    return {
        latitude: szerokosc_geograficzna,
        longitude: dlugosc_geograficzna
    };
}
	function geolokacja() {
		if (navigator.geolocation) {
		  navigator.geolocation.getCurrentPosition(
			position => {
			  console.log(position);
			  const szerokosc = position.coords.latitude;
			  const dlugosc = position.coords.longitude;
			  const skonwertowane_wspolrzedne = konwertuj_wspolrzedne(szerokosc, dlugosc);
			  const { latitude, longitude } = skonwertowane_wspolrzedne;
			  wspolrzedne.innerHTML = `Twoje współrzędne: szerokość ${latitude}, długość ${longitude}`;
			  map.setView([szerokosc, dlugosc]);
			  const marker = L.marker([szerokosc, dlugosc]).addTo(map);
			},
			positionError => {
			  console.error(positionError);
			}
			);
			rasterPrzycisk.disabled = false;
		} else {
			console.log("Geolokalizacja nie jest obsługiwana przez Twoją przeglądarkę.");
		}
  }
    function raster() {
        leafletImage(map, function (err, canvas) {
            img.width = map.getSize().x;
            img.height = map.getSize().y;
            img.src = canvas.toDataURL();
            if (err) {
                console.error(err);
                return;
            }
            map2.innerHTML = '';
            map2.appendChild(canvas);
        });
        puzzlePrzycisk.disabled = false;
    }
    function puzzle(){
        puzzlePole.innerHTML = "";
        map2.innerHTML="";
        var punktyStartowe = [
            [0, 0], [100, 0], [200, 0], [300, 0],
            [0, 100], [100, 100], [200, 100], [300, 100],
            [0, 200], [100, 200], [200, 200], [300, 200],
            [0, 300], [100, 300], [200, 300], [300, 300]];
        punktyStartowe = sortuj_losowo(punktyStartowe);
        console.log(punktyStartowe)
    for (let i = 0; i < 16; i++) {
      let kafelek = utworzKafelek(i);
      map2.appendChild(kafelek);
    }
    for (let i = 0; i < punktyStartowe.length; i++) {
      let canvas = utworz_canvas(i, punktyStartowe[i][0], punktyStartowe[i][1]);
      puzzlePole.appendChild(canvas);
    }
    sprawdzPrzycisk.disabled = false;
  }
  
  function utworzKafelek(indeks) {
    let kafelek = document.createElement("div");
    kafelek.className = "kafelek";
    kafelek.id = "kafelek" + indeks;

    kafelek.addEventListener("mouseover", function () {
      this.style.backgroundColor = "red";
    });
    kafelek.addEventListener("mouseout", function () {
      this.style.backgroundColor = "";
    });
    kafelek.addEventListener("dragover", function (event) {
      event.preventDefault();
    });
    kafelek.addEventListener("drop", function (event) {
      event.preventDefault();
      if (this.hasChildNodes() === false) {
        let elem = document.querySelector("#" + event.dataTransfer.getData("text"));
        this.appendChild(elem);
      }
    }, false);
	
    return kafelek;
  }

  function utworz_canvas(indeks, x, y) {
    let canvas = document.createElement("canvas");
    canvas.draggable = true;
    canvas.id = "puzzel" + indeks;
    canvas.className = "canvas-item";
    canvas.width = 100;
    canvas.height = 100;

    canvas.addEventListener("dragstart", function (event) {
      event.dataTransfer.setData("text", this.id);
    });
    let puzzelCanvas = canvas.getContext("2d");
    puzzelCanvas.drawImage(img, x, y, 100, 100, 0, 0, 100, 100);

    return canvas;
  }
	function sortuj_losowo(tablica) {
		return tablica.sort(() => Math.random() - 0.5);
	}
	function porownaj_obrazki(canvas1, image) {
		let kontekst1 = canvas1.getContext("2d");
		let canvas2 = document.createElement("canvas");
		canvas2.width = canvas1.width;
		canvas2.height = canvas1.height;
		let kontekst2 = canvas2.getContext("2d");
		kontekst2.drawImage(image, 0, 0, canvas1.width, canvas1.height);
		let dane1 = kontekst1.getImageData(0, 0, canvas1.width, canvas1.height).data;
		let dane2 = kontekst2.getImageData(0, 0, canvas1.width, canvas1.height).data;
		for (let i = 0; i < dane1.length; i++) {
			if (dane1[i] !== dane2[i]) {
				return false;
			}
		}
		return true;
	}
    function sprawdz() {
        let ulozonyObrazek = document.createElement("canvas");
        let ulozonyKontekst = ulozonyObrazek.getContext("2d");
        ulozonyObrazek.width = 400;
        ulozonyObrazek.height = 400;
        for (let i = 0; i < 16; i++) {
            let kafelek = document.getElementById("kafelek" + i);
            let canvas = kafelek.querySelector("canvas");
            if (canvas) {
                let kontekst = canvas.getContext("2d");
                if (kontekst) {
                    ulozonyKontekst.drawImage(kontekst.canvas, (i % 4) * 100, Math.floor(i / 4) * 100, 100, 100);
                } else {
                    console.error("getContext() nie zwróciło kontekstu");
                }
            } else {
                console.error("Nie można znaleźć canvasa dla #kafelek" + i);
            }
        }
        if (porownaj_obrazki(ulozonyObrazek, img)) {
            alert("SUKCES!");
        } else {
            alert("KICHA!");
            puzzle();
        }
    }
});