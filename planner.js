/*
TODO list:
6. работа search элемента
7. мобильная версия без бэклога
*/
let left_day;
let today;
let users;

let planner_tasks=[];
let backlog_tasks =[];

function showDate(){
    let res;
    let month;
    let day;
    let nextDay = left_day;
    
    for(let i=0;i<7;i++){
        res = '';
        month = nextDay.getMonth()+1;
        day = nextDay.getDate();
        res += (day > 9) ? day : ('0' + day);
        res += '.';
        res += (month >9) ? month : ('0' + month);
        //res = nextDay.getDate() + '.' + month;
        document.getElementById('day' + (i+1)).textContent = res;
        nextDay.setDate(nextDay.getDate()+1);
    }
    left_day.setDate(left_day.getDate()-7);
    

    
}

function scrolltoRight(toRight){
  for(let i =0; i < users.length;i++){
    for(let j =0; j < 7;j++){
      document.getElementById('cell'+users[i]['id']+'_'+(j+1)).innerHTML = "";
    }
  }
  if(toRight){
  left_day.setDate(left_day.getDate()+7);
  }
  else{
    left_day.setDate(left_day.getDate()-7);
  }
  showDate();
  drawTasks();
}

function curDayBelongsGap(curDay, planStartDate, planEndDate){
  
let start = planStartDate.split('-');
let end = planEndDate.split('-');

if( (start[0]<curDay.getFullYear()) || ((start[0]==curDay.getFullYear())&&(start[1]<curDay.getMonth()+1)) ||  ((start[0]==curDay.getFullYear())&&(start[1]==curDay.getMonth()+1)&&(start[2]<=curDay.getDate()))  )
{
  if( (end[0]>curDay.getFullYear()) || ((end[0]==curDay.getFullYear())&&(end[1]> curDay.getMonth()+1))  || ((end[0]==curDay.getFullYear())&&(end[1]==curDay.getMonth()+1)&&(end[2]>=curDay.getDate()))  )
  {
    return true;
  }

}
return false;
}

function drawTasks(){
  for(let i =0; i < users.length;i++){
    for(let j =0; j < 7;j++){
      document.getElementById('cell'+users[i]['id']+'_'+(j+1)).innerHTML = "";
    }
  }
  let tasks_in_one_day = 0;
  let global_task_name = 0;
  var newDiv;
  
  for(let i=0;i<users.length;i++){
    user_tasks = planner_tasks.filter(task => task['executor']==users[i]['id']);
    
    for(let weekDay=0;weekDay<7;weekDay++){
      left_day.setDate(left_day.getDate()+weekDay)
          for(let thisUserTask =0; thisUserTask<user_tasks.length;thisUserTask++){
            
            tasks_in_one_day += curDayBelongsGap(left_day, user_tasks[thisUserTask]['planStartDate'], user_tasks[thisUserTask]['planEndDate']) ? 1 : 0;
            }
            //tasks_in_one_day - нашли количество задач для пользователя в текущий день недели
            //теперь можно записать задачи в текущий день недели
            
            for(let thisUserTask =0; thisUserTask<user_tasks.length;thisUserTask++){
              if(curDayBelongsGap(left_day, user_tasks[thisUserTask]['planStartDate'], user_tasks[thisUserTask]['planEndDate']))
              {
                newDiv = document.createElement("div");
                newDiv.setAttribute('class', 'planner-cell planner-task');
                newDiv.setAttribute('data-title', user_tasks[thisUserTask]['subject']);
                newDiv.setAttribute('style', 'height: calc(' + Math.trunc(100/tasks_in_one_day) + '% - 2px);');
                newDiv.textContent = 'задача ' + (global_task_name + thisUserTask);
                document.getElementById('cell' + users[i]['id'] + '_' + (weekDay+1)).append(newDiv);
              }

            }
            tasks_in_one_day=0;
            left_day.setDate(left_day.getDate()-weekDay);
            
    }
    global_task_name +=user_tasks.length;
  }

}

async function onLoad(){
    
        /*
            При загрузке страницы происходит загрузка существующих пользователей планироващика
            Строится грид на соответсвтующее количество строк
        */
           let result = await fetch('http://localhost:3000/users', {
            method : 'GET',
            header : {
              'Content-Type' : 'application/json'
            }
         
          });

          let resultJSON = await result.json();
          users = resultJSON;
          
          var newDiv;
          for(let i=0; i < resultJSON.length;i++){
            newDiv = document.createElement("div");
            newDiv.setAttribute('class', 'planner-name planner-row droppable');
            newDiv.setAttribute('id', 'cell' + resultJSON[i]['id']+'_0');
            newDiv.setAttribute('style','grid-row-start:' +(i+3)+ ';grid-column-start: 1;')
            newDiv.textContent = resultJSON[i]['firstName'];
            document.getElementById('planner').append(newDiv);
            for(let j=0;j<7;j++){
                newDiv = document.createElement("div");
            newDiv.setAttribute('class', 'planner-row droppable');
            //клетки таблицы имеют id формата: id юзера + номер дня недели от 1 до 7;
            newDiv.setAttribute('id', 'cell' + resultJSON[i]['id']+'_'+(j+1));
            newDiv.setAttribute('style','grid-row-start:' +(i+3)+ ';grid-column-start:' +(j+2)+';')
            document.getElementById('planner').append(newDiv);
            }
          }
          
        //подгружаем в верхние ячейки грида даты текущей недели
        let date = new Date();
        today = date.getDay();
        if(today == 0){
            date.setDate(date.getDate()-6);
        }
        else{
            date.setDate(date.getDate() - today+1);
        }
        left_day = date;//при загрузке страницы сохраняем в left_day дату последнего понедельника
        showDate();
        

        /*
            После того как планировщик подготовлен подгружаем имеющиеся задачи
            задачи, не имеющие исполнителя, сразу закидываем в backlog
            задачи, имеющие исполнителя, добавляем в соотвествующие ячейки grid
        */
         
         result = await fetch('http://localhost:3000/tasks', {
            method : 'GET',
            header : {
              'Content-Type' : 'application/json'
            }
         
          });
        resultJSON = await result.json();
        
        for(let i=0;i<resultJSON.length;i++){
          
          if(resultJSON[i]['executor'] === null){
            backlog_tasks.push(resultJSON[i]);
          }
          else{
            planner_tasks.push(resultJSON[i]);
          }
        }
         
        drawBaclLog();
         drawTasks();
         
}


function drawBaclLog(){
  document.getElementById('backlog').innerHTML = '';
  document.getElementById('backlog').innerHTML = `<div class="backlog-head"><b>BACKLOG</b></div>
                                                  <div class="search-container">
                                                  <input type="text" id="search-bar" placeholder="Поиск">
                                                  <span class="span-indent lupa"></span>
                                                   </div>`
  let whoCreatedTask = '';
  for(let i=0;i<backlog_tasks.length;i++){

         
         whoCreatedTask = users.filter(user => user['id']== backlog_tasks[i]['creationAuthor']);

         newDiv = document.createElement("div");
         newDiv.setAttribute('class', 'task');            
         newDiv.setAttribute('id', backlog_tasks[i]['id']);
         newDiv.innerHTML ='<span class="creationAuthor">'+whoCreatedTask[0]['username']+'</span> <div class="description">'+ backlog_tasks[i]['subject']+'</div>';                
         document.getElementById('backlog').append(newDiv);
      
  }
  dragAndDrop();


}


var listener = function(event) {//перемещение таска из бэклога
  var log_task = event.currentTarget;
  let log_task_width = log_task.offsetWidth;
  let shiftX = event.clientX - log_task.getBoundingClientRect().left;
  let shiftY = event.clientY - log_task.getBoundingClientRect().top;

  log_task.style.position = 'absolute';
  log_task.style.zIndex = 1000;
  document.body.append(log_task);
  log_task.style.width = log_task_width + 'px';
  moveAt(event.pageX, event.pageY);

  function moveAt(pageX, pageY) {
    log_task.style.left = pageX - shiftX + 'px';
    log_task.style.top = pageY - shiftY + 'px';
  }
  function returnToDom(){
    let event = new Event("mouseup");
    log_task.dispatchEvent(event);
  }

  let currentDroppable = null;
  function onMouseMove(event) {
    moveAt(event.pageX, event.pageY);

    log_task.hidden = true;
    let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    log_task.hidden = false;
    if (!elemBelow) {returnToDom();}
    else{
    let droppableBelow = elemBelow.closest('.droppable');

    if (currentDroppable != droppableBelow) {
        
      if (currentDroppable) {
        // вылет из droppable 
        currentDroppable.classList.remove("hilight");
      }
      currentDroppable = droppableBelow;
      if (currentDroppable) {
        // влетаем в элемент droppable
        currentDroppable.classList.add("hilight");

      }
    }
  }
  }

  
  document.addEventListener('mousemove', onMouseMove);

  
  log_task.onmouseup = function() {
    document.removeEventListener('mousemove', onMouseMove);
    log_task.onmouseup = null;
    
    
    log_task.remove();
    if(currentDroppable === null){
      drawBaclLog();//отпустили таск не на клетку, заново перерисовываем его в бэклог
    }
    else{
        /*
          В случае удачного закидывания на клетку парсим id пользователя и номер дня недели из currentDroppable.getAttribute('id'); cell[userid]_[weekday]
          переносим таск из массива бэклога в массив планнера, по id log_task.getAttribute('id') 
          перерисовываем бэклог
        */
        currentDroppable.classList.remove("hilight");
        let parse = currentDroppable.getAttribute('id');
        parse = parse.substr(4);

        parse = parse.split('_');
        
        for(let b_task =0; b_task < backlog_tasks.length;b_task++){
          if(log_task.getAttribute('id') == backlog_tasks[b_task]['id']){
            backlog_tasks[b_task]['executor'] = parse[0];
            if(parse[1] != 0){
              left_day.setDate(left_day.getDate() + (parse[1]-1));
              let changeDateType = '';
              changeDateType += left_day.getFullYear();
              changeDateType += '-';
              changeDateType += (left_day.getMonth()+1);
              changeDateType += '-';
              changeDateType += left_day.getDate();
              backlog_tasks[b_task]['planStartDate'] = changeDateType;
              backlog_tasks[b_task]['planEndDate'] = changeDateType;
              left_day.setDate(left_day.getDate() - (parse[1]-1));
            }

            planner_tasks.push(backlog_tasks[b_task]);
            
          }
          
        }
        
        backlog_tasks = backlog_tasks.filter(task => task['id'] != log_task.getAttribute('id'));
         drawTasks();
        // drawBaclLog();
        
    }
 

  };
  log_task.ondragstart = function() {
    return false;
  };
};




function dragAndDrop(){

  for(let i=0; i < backlog_tasks.length;i++){
    
  var log_task = document.getElementById(backlog_tasks[i]['id']);
  
  log_task.removeEventListener('mousedown', listener);
  log_task.addEventListener('mousedown', listener);

}

}

