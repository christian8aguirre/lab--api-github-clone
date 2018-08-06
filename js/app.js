var request = superagent;
var API_BASE = 'https://api.github.com';
var auth = `?access_token=${OAUTH_TOKEN}`;
var QUERY_USERS = '/users/';
var QUERY_REPOS = '/repos'

var form = document.forms.buscador;

form.addEventListener('submit',function (e) {
  e.preventDefault();
  var textBox = e.target.elements.searchTexbox;
  var user = textBox.value;
  requestMain(user);
});


function requestMain(user) {
  request
  .get(`${API_BASE}${QUERY_USERS}${user}${auth}`)
  .then(function (response) {
    return response.body;
  })
  .then(changeProfile)
  .then(getRepositories)
  
}

//====================================================
//Función para cambiar los datos del la columna izquierda
function changeProfile(info) { 
  var a = document.querySelector('.userSection .imageURLProfile');
  var user = document.querySelector('.user .user--name');
  var nickName = document.querySelector('.user .user--nickName');
  var detailsUser = document.querySelectorAll('.details .details--list li');
  a.setAttribute('href',info.avatar_url);
  a.children[0].src = info.avatar_url;
  if (info.name !== '') {
    user.textContent = info.name;
  }
  nickName.textContent = info.login;
  
  detailsUser.forEach(function (element) {
    if (info.company !=='' & info.company !==null & element.className === 'company') {
      element.innerHTML = '<i class="fa fa-user"></i><strong> '+info.company+'</strong>';
    } else if (info.location !== '' & info.location !== null & element.className === 'location') {
      element.innerHTML = '<i class="fa fa-map-marker"></i> '+ info.location;
    } else if (info.email !=='' & info.email !== null & element.className === 'email') {
      element.innerHTML = '<i class="fa fa-envelope-o"></i> <a href='+ info.email+'> ' + info.email + '</a>';
    } else if (info.blog !== '' & info.blog !== null & element.className === 'blog') {
      element.innerHTML = '<i class="fa fa-link"></i> ' + info.blog;
    } else{
      element.hidden = true;
    }
  });
  return info.login;

}

//====================================================
//Función para obtener los reositorios y obtener las variables
function getRepositories(user) {
  var filterRespositories = document.querySelector('.ui-tabs__filter .textbox');
      var ul = document.querySelector('.ui-tabs__content');
      var hr = document.createElement('hr');
      ul.innerHTML = '';
      request.get(`${API_BASE}${QUERY_USERS}${user}${QUERY_REPOS}${auth}`)
      .then(function(response) {
        var repositories = response.body;
        repositories = orderRepositoriesByDate(repositories);
        filterRespositories.addEventListener('keydown',function (e) {
          var ENTER_KEY = 13;
          if (e.keyCode === ENTER_KEY){
            ul.innerHTML ='';
            var template ='';
            repositories.forEach(function (repository) {
            var  x = repository.name.toLowerCase();
            var repo = filterRespositories.value.toLowerCase();
            if (filterRespositories.value ==='') {
              createData(repository);
              } else if(x.indexOf(repo) > -1 ){
                createData(repository);
              }  
              template = createTemplate(object);
              ul.innerHTML += template;
              ul.appendChild(hr);
            })
          }
      })
  })
}
//===============
function createData(repository) {
  object = {
    name : repository.name,
    description : repository.description,
    pushed_at: repository.pushed_at,
    language: repository.language,
    star: repository.stargazers_count,
    forks : repository.forks,
    license : repository.license,
    pushedDate: Days(repository.pushed_at)
  }
  return object;
}



//====================================================
//Función para armar el template de los repositorios
function createTemplate(object) {
  template=`
          <li>
            <div class="repositoryName">
              <a href="#">
                <h3>${object.name}</h3>
              </a>
            </div>
            <div class="repositorySummary">
              <p>` + (object.description !== null ? object.description : '')+`</p>
              <span>X</span>
            </div>
            <div class="repositoryTags">
              <a href="#">php</a>
            </div>
            <div class="repositoryDetails">`
            + (object.language !== null ? `<span class="repoLanguage ` + (object.language === 'C++' ? 'Cplusplus' : object.language) + `"></span><span class="space"> ${object.language}</span>` : '') 
            + (object.star !== 0 ? `<span class="space"><i class="fa fa-star"></i><a  href="#">${object.star}</a></span>` : '')
            + (object.forks !== 0 ? `<span class="space"><i class="fa fa-code-fork"></i><a  href="#">${object.forks}</a></span> `: '')
            + (object.license !==null ? `<span class="space"><i class="fa fa-balance-scale"></i><a  href="#">${object.license.spdx_id}</a></span>`: '')
            + `Updated
              <relative-time datetime="">${object.pushedDate}</relative-time>
            </div>
          </li>`
          return template;
}
//====================================================
//Función para ordenar los repositorios por fecha de Updated
function orderRepositoriesByDate(repositories) {
  var temp ={};
  for (let j = 0; j < repositories.length; j++) {
    for (let i = 0; i < repositories.length; i++) {
      if (repositories[j].pushed_at > repositories[i].pushed_at) {
         temp = repositories[j];
         repositories[j] = repositories[i];
         repositories[i] = temp;
      }
    }
  }
  return repositories;
}

//====================================================
//Función para comparar la fecha de Updated y la actual
function Days(pushedDate) {
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var completeDate = pushedDate.split('T').slice(0,1).join('').split('-');
  var dayPushed = completeDate[2];
  var monthPushed = months[parseInt(completeDate[1]-1)];
  var yearPushed = completeDate[0];
  date1 = new Date(pushedDate.split('').slice(0,20).join(''));
  var utc = new Date().toLocaleDateString();
  var completeUtc = utc.split('T').slice(0,1).join('').split('/');
  var dayUtc = completeUtc[1];
  var monthUtc = months[parseInt(completeUtc[0]-1)];
  var yearUtc = completeUtc[2];
  utc = new Date (utc)
  var timeDiff = Math.abs(utc.getTime() - date1.getTime());
  var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  if (diffDays < 30){
    return diffDays + ' days ago';
  } else if(diffDays < 30 && yearUtc === yearPushed && monthUtc === monthPushed) {
    return diffDays + ' days ago';
  } else if (diffDays > 30 && yearUtc === yearPushed && monthUtc !== monthPushed){
    return ` on ${monthPushed} ${dayPushed}`;
  } else if (diffDays > 30 && yearUtc !== yearPushed && monthUtc !== monthPushed){
    return ` on ${monthPushed} ${dayPushed}, ${yearPushed}`;
  } else {
    return ` on ${monthPushed} ${dayPushed}, ${yearPushed}`;
  }
}