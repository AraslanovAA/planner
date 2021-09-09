/*
TODO list:
1.сделать массив распределённых тасков
 массив нераспределённых тасков
2. отображать распределённые таски
3.реализовать скролы недель
4. добавить подсказки при наведении
5. drag-n-drop нераспределённых тасков
*/
let left_day;
let today;
let users;
let tasks;

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
    console.log(left_day);

    
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
          console.log(resultJSON[0]['firstName']);
          var newDiv;
          for(let i=0; i < resultJSON.length;i++){
            newDiv = document.createElement("div");
            newDiv.setAttribute('class', 'planner-name planner-row');
            newDiv.setAttribute('style','grid-row-start:' +(i+3)+ ';grid-column-start: 1;')
            newDiv.textContent = resultJSON[i]['firstName'];
            document.getElementById('planner').append(newDiv);
            for(let j=0;j<7;j++){
                newDiv = document.createElement("div");
            newDiv.setAttribute('class', 'planner-row');
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
        tasks = resultJSON;
         console.log(resultJSON);
         let whoCreatedTask = '';
         for(let i=0;i<resultJSON.length;i++){
             if(resultJSON[i]['executor'] === null){
                
                whoCreatedTask = users.filter(user => user['id']== resultJSON[i]['creationAuthor']);

                newDiv = document.createElement("div");
                newDiv.setAttribute('class', 'task');              
                newDiv.innerHTML ='<span class="creationAuthor">'+whoCreatedTask[0]['username']+'</span> <div class="description">'+ resultJSON[i]['subject']+'</div>';                
                document.getElementById('backlog').append(newDiv);
             }
         }



         
}