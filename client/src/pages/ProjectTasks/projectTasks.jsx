import './projectTasks.css'
import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import {DELETE, GET, POST, PUT} from "../../utils/methods.jsx";
import {checkResponse} from "../../utils/response.jsx";
import Button from "../../widgets/Button/button.jsx";
import Filters from "../../components/Filters/filters.jsx";
import Textbox from "../../widgets/Textbox/textbox.jsx";
import Dropdown from "../../widgets/Dropdown/dropdown.jsx";
import Checkbox from "../../widgets/Checkbox/checkbox.jsx";
import ListElement from "../../components/ListElement/listElement.jsx";
import task_icon from '../../assets/images/project.svg'
import {getDataByIDs, getFilters} from "../../utils/data.jsx";
import ProjectTaskProperties from "../../components/ProjectTaskProperties/projectTaskProperties.jsx";
import Modal from "../../components/Modal/modal.jsx";
import Selection from "../../widgets/Selection/selection.jsx";
import FilePicker from "../../widgets/FilePicker/filePicker.jsx";
import {getDateFromInput, getDateFromRequest} from "../../utils/date.jsx";
import {checkConfirmation} from "../../utils/request.jsx";
import NoContent from "../../components/NoContent/noContent.jsx";

export default function ProjectTasks() {
    let {id} = useParams()
    const [tasks, setTasks] = useState([])
    const [members, setMembers] = useState([])
    const [statuses, setStatuses] = useState([])
    const [priorities, setPriorities] = useState([])

    const [statusesStatus, setStatusesStatus] = useState('')
    const [prioritiesStatus, setPrioritiesStatus] = useState('')

    const [selectionMembers, setSelectionMembers] = useState([])
    const [taskStatus, setTaskStatus] = useState('')

    const [taskFiles, setTaskFiles] = useState([])
    const [taskId, setTaskId] = useState(null)

    const [taskManagementType, setTaskManagementType] = useState('')
    const [taskFileManagementSatus, setTaskFileManagementSatus] = useState('')

    function getStatuses() {
        axios(GET(`/api/projects/${id}/statuses/`)).then(
            (response) => {
                checkResponse(response, setStatuses, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }

    function getPriorities() {
        axios(GET(`/api/projects/${id}/priorities/`)).then(
            (response) => {
                checkResponse(response, setPriorities, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }

    function getTasks() {
        [
            'dropdown_executor_details',
            'dropdown_status_details',
            'dropdown_priority_details'
        ].forEach((value) => {
            const dropdownElement = document.getElementById(value)
            dropdownElement.removeAttribute('open')
        })

        let url = `/api/projects/${id}/tasks/`
        url = getFilters(url, [
            'start_date',
            'end_date',
            'dropdown_executor',
            'dropdown_status',
            'dropdown_priority'
        ])

        axios(GET(url)).then(
            (response) => {
                checkResponse(response, setTasks, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }

    useEffect(() => {
        axios(GET(`/api/projects/${id}/members/`)).then(
            (response) => {
                checkResponse(response, setMembers, response.data, () => {
                    const data = []

                    response.data.map((member) => {
                        data.push({
                            id: member.id,
                            name: member.get_full_name
                        })
                    })
                    setSelectionMembers(data)
                })
            }
        ).catch((error) => {
            checkResponse(error.response)
        })

        getStatuses()
        getPriorities()
        getTasks()
    }, [id]);

    function createStatus(color) {
        const data = getDataByIDs([
            ['status_name', 'name'],
            ['status_is_means_completeness', 'is_means_completeness']
        ])
        data['color'] = color

        axios(POST(`/api/projects/${id}/statuses/`, data)).then(
            (response) => {
                checkResponse(response, setStatusesStatus, 'Успешно создали статус!', getStatuses)
            }
        ).catch((error) => {
            checkResponse(error.response, setStatusesStatus, null, null, null, 'status')
        })
    }

    function editStatus(statusId, color) {
        const data = getDataByIDs([
            ['status_name', 'name'],
            ['status_is_means_completeness', 'is_means_completeness']
        ])
        data['color'] = color

        axios(PUT(`/api/projects/${id}/statuses/${statusId}/`, data)).then(
            (response) => {
                checkResponse(response, setStatusesStatus, 'Успешно изменили статус!', () => {
                    getTasks()
                    getStatuses()
                })
            }
        ).catch((error) => {
            checkResponse(error.response, setStatusesStatus, null, null, null, 'status')
        })
    }

    function createPriority(color) {
        const data = getDataByIDs([
            ['priority_name', 'name']
        ])
        data['color'] = color

        axios(POST(`/api/projects/${id}/priorities/`, data)).then(
            (response) => {
                checkResponse(response, setPrioritiesStatus, 'Успешно создали приоритет!', getPriorities)
            }
        ).catch((error) => {
            checkResponse(error.response, setPrioritiesStatus, null, null, null, 'priority')
        })
    }

    function editPriority(priorityId, color) {
        const data = getDataByIDs([
            ['priority_name', 'name']
        ])
        data['color'] = color

        axios(PUT(`/api/projects/${id}/priorities/${priorityId}/`, data)).then(
            (response) => {
                checkResponse(response, setPrioritiesStatus, 'Успешно изменили приоритет!', () => {
                    getTasks()
                    getPriorities()
                })
            }
        ).catch((error) => {
            checkResponse(error.response, setPrioritiesStatus, null, null, null, 'priority')
        })
    }

    function deleteStatus(status_id) {
        axios(DELETE(`/api/projects/${id}/statuses/${status_id}/`)).then(
            (response) => {
                checkResponse(response, null, null, () => {
                    getTasks()
                    getStatuses()
                })
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }

    function deletePriority(priority_id) {
        axios(DELETE(`/api/projects/${id}/priorities/${priority_id}/`)).then(
            (response) => {
                checkResponse(response, null, null, () => {
                    getTasks()
                    getPriorities()
                })
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }

    function sendFiles(task_id) {
        if (task_id !== null) {
            const formData = getDataByIDs([
                ['project_task_files_uploaded_files', 'uploaded_files']
            ], true)

            if (Array.from(formData.keys()).length) {
                axios(POST(`/api/projects/${id}/tasks/${task_id}/files/`, formData)).then(
                    (response) => {
                        checkResponse(response, setTaskFileManagementSatus, 'Успешно загрузили файлы!', () => {
                            getTaskFiles(task_id)
                        })
                    }
                ).catch((error) => {
                    checkResponse(error.response, setTaskFileManagementSatus)
                })
            }
        }
    }

    function manageTask(taskId) {
        const ids = [
            ['project_task_name', 'name'],
            ['project_task_status', 'status_id'],
            ['project_task_start_date', 'start_date'],
            ['project_task_priority', 'priority_id'],
            ['project_task_end_date', 'end_date'],
            ['project_task_executor', 'executor_id'],
            ['project_task_description', 'description'],
        ]

        if (!taskId) {
            ids.push(['project_task_file', 'uploaded_files'])
        }
        const data = getDataByIDs(ids, true, true)

        if (typeof data.get('uploaded_files') === "string") {
            data.delete('uploaded_files')
        }

        data.set('start_date', getDateFromInput(data.get('start_date')))
        data.set('end_date', getDateFromInput(data.get('end_date')))

        axios(taskId ? PUT(`/api/projects/${id}/tasks/${taskId}/`, data) : POST(`/api/projects/${id}/tasks/`, data)).then(
            (response) => {
                checkResponse(response, setTaskStatus, taskId ? 'Успешно изменили задачу!' : 'Успешно создали задачу!', getTasks)
            }
        ).catch((error) => {
            checkResponse(error.response, setTaskStatus, null, null, null, 'project_task')
        })
    }

    function getTaskFiles(taskId) {
        axios(GET(`/api/projects/${id}/tasks/${taskId}/files/`)).then(
            (response) => {
                checkResponse(response, setTaskFiles, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }

    function openModal(id) {
        const modal = document.getElementById(id)
        modal.classList.add('show_modal')
        modal.classList.remove('hide_modal')

        if (id === 'project_task_files') {
            setTaskFileManagementSatus('')
        }
    }

    function openTaskManagementModal(buttonText, name, status, startDate, priority, endDate, executor, description, onclick) {
        openModal('project_task_management')
        setTaskManagementType(buttonText)

        const button = document.getElementById('project_task_management_manage_button')
        button.textContent = buttonText
        button.onclick = onclick

        const taskName = document.getElementById('project_task_name')
        const taskStatus = document.getElementById('project_task_status')
        const taskStartDate = document.getElementById('project_task_start_date')
        const taskPriority = document.getElementById('project_task_priority')
        const taskEndDate = document.getElementById('project_task_end_date')
        const taskExecutor = document.getElementById('project_task_executor')
        const taskDescription = document.getElementById('project_task_description')

        console.log(priority)

        taskName.value = name
        taskStatus.value = status
        taskStartDate.value = startDate
        taskPriority.value = priority
        taskEndDate.value = endDate
        taskExecutor.value = executor
        taskDescription.value = description
    }

    return (
        <>
            <div className="window_main_content">
                <div className="project_task_manage_buttons">
                    <Button onClick={() => {
                        setTaskStatus('')
                        openTaskManagementModal('Создать', '', '', '', '', '', '', '', () => {
                            manageTask()
                        })
                    }}>Создать задачу</Button>
                    <Button onClick={() => {
                        getStatuses()
                        openModal('project_statuses')
                    }}>Статусы</Button>
                    <Button onClick={() => {
                        getPriorities()
                        openModal('project_priorities')
                    }}>Приоритеты</Button>
                </div>
                <Filters filterEvent={getTasks}>
                    <Textbox id='start_date' type='date' label='Дата начала'/>
                    <Textbox id='end_date' type='date' label='Дата окончания'/>
                    <Dropdown id='dropdown_executor' name='Исполнитель' style={{zIndex: 5}}>
                        {
                            members.map((member) => {
                                return (
                                    <>
                                        <Checkbox splash={true}
                                                  id={`checkbox_executor_${member.id}`}>{member.get_full_name}</Checkbox>
                                    </>
                                )
                            })
                        }
                    </Dropdown>
                    <Dropdown id='dropdown_status' name='Статус' style={{zIndex: 4}}>
                        {
                            statuses.map((status) => {
                                return (
                                    <>
                                        <Checkbox splash={true} id={`checkbox_status_${status.id}`}
                                                  background_color={`#${status.color}`}>{status.name}</Checkbox>
                                    </>
                                )
                            })
                        }
                    </Dropdown>
                    <Dropdown id='dropdown_priority' name='Приоритет' style={{zIndex: 3}}>
                        {
                            priorities.map((priority) => {
                                return (
                                    <>
                                        <Checkbox splash={true} id={`checkbox_priority_${priority.id}`}
                                                  background_color={`#${priority.color}`}>{priority.name}</Checkbox>
                                    </>
                                )
                            })
                        }
                    </Dropdown>
                </Filters>
                {
                    tasks.length > 0 ? <>
                        <ul className='project_tasks_list'>
                            {tasks.map((task) => {
                                return (
                                    <>
                                        <ListElement defaultIcon={task_icon} headerText={task.name}
                                                     text={task.description}
                                                     additionalButtons={<>
                                                         <Button className='light_button' onClick={() => {
                                                             getTaskFiles(task.id)
                                                             setTaskId(task.id)
                                                             openModal('project_task_files')
                                                         }}>Файлы</Button>
                                                         <Button className='light_button' onClick={() => {
                                                             setTaskStatus('')
                                                             openTaskManagementModal(
                                                                 'Изменить',
                                                                 task.name,
                                                                 task.status ? task.status.id : '',
                                                                 getDateFromRequest(task.start_date),
                                                                 task.priority ? task.priority.id : '',
                                                                 getDateFromRequest(task.end_date),
                                                                 task.executor ? members.filter((member) => member.email === task.executor)[0].id : '',
                                                                 task.description,
                                                                 () => {
                                                                     manageTask(task.id)
                                                                 }
                                                             )
                                                         }}>Изменить</Button>
                                                         <Button className='red_button' onClick={() => {
                                                             checkConfirmation(
                                                                 'Уверены, что хотит эту удалить задачу?',
                                                                 () => {
                                                                     axios(DELETE(`/api/projects/${id}/tasks/${task.id}/`)).then(
                                                                         (response) => {
                                                                             checkResponse(response, null, null, getTasks)
                                                                         }
                                                                     ).catch((error) => {
                                                                         checkResponse(error.response)
                                                                     })
                                                                 }
                                                             )
                                                         }}>Удалить</Button>
                                                     </>}>
                                            {
                                                task.executor ?
                                                    <>
                                                        <Link to={`/users/${task.executor_read_id}/`}
                                                              className='list_element__header__text'>Исполнитель: <span
                                                            className='list_element__header__text__important'>{task.executor}</span>
                                                        </Link>
                                                    </> : ''
                                            }
                                            {
                                                task.start_date ?
                                                    <>
                                                        <p className='list_element__header__text'>
                                                            Дата начала: <span
                                                            className='list_element__header__text__important'>
                                                        {task.start_date}
                                                    </span>
                                                        </p>
                                                    </> : ''
                                            }
                                            {
                                                task.end_date ?
                                                    <>
                                                        <p className='list_element__header__text'>
                                                            Дата окончания: <span
                                                            className='list_element__header__text__important'>
                                                        {task.end_date}
                                                    </span>
                                                        </p>
                                                    </> : ''
                                            }
                                            {
                                                task.status ?
                                                    <>
                                                        <div className="project_task_status"
                                                             style={{backgroundColor: `#${task.status.color}`}}>
                                                            {task.status.name}
                                                        </div>
                                                    </> : ''
                                            }
                                            {
                                                task.priority ?
                                                    <>
                                                        <div className="project_task_priority"
                                                             style={{backgroundColor: `#${task.priority.color}`}}>
                                                            {task.priority.name}
                                                        </div>
                                                    </> : ''
                                            }
                                        </ListElement>
                                    </>
                                )
                            })}
                        </ul>
                    </> : <NoContent/>
                }
            </div>
            <ProjectTaskProperties id='project_statuses' whatCreate='статус' data={statuses} rounded={true}
                                   deleteFunc={deleteStatus} prefix='status' createFunc={createStatus}
                                   status={statusesStatus} statusSetter={setStatusesStatus} editFunc={editStatus}/>
            <ProjectTaskProperties id='project_priorities' whatCreate='приоритет' data={priorities}
                                   deleteFunc={deletePriority} prefix='priority' createFunc={createPriority}
                                   status={prioritiesStatus} statusSetter={setPrioritiesStatus}
                                   editFunc={editPriority}/>
            <Modal id='project_task_management' className='project_task_management_modal' status={taskStatus}
                   manageButtons={<>
                       <Button id='project_task_management_manage_button'/>
                   </>}>
                <div className="project_task_management">
                    <div className="project_task_management__inline">
                        <div className="project_task_management__column">
                            <Textbox label='Название' id='project_task_name' isRequired={true}/>
                            <Selection id='project_task_status' data={statuses} colorAttr={'color'} allow_null={true}>
                                Статус</Selection>
                        </div>
                        <div className="project_task_management__column">
                            <Textbox type='date' label='Дата начала' id='project_task_start_date'/>
                            <Selection id='project_task_priority' data={priorities} allow_null={true}
                                       colorAttr={'color'}>Приоритет</Selection>
                        </div>
                        <div className="project_task_management__column">
                            <Textbox type='date' label='Дата окончания' id='project_task_end_date'/>
                            <Selection id='project_task_executor' data={selectionMembers} allow_null={true}>
                                Исполнитель
                            </Selection>
                        </div>
                    </div>
                    {
                        taskManagementType === 'Создать' ?
                            <FilePicker id='project_task_file' multiple={true}>Загрузить файлы</FilePicker> : ''
                    }
                    <Textbox type='textarea' id='project_task_description'
                             placeholder='Краткое описание для задачи:'/>
                </div>
            </Modal>
            <Modal className='project_task_files__window' id='project_task_files' manageButtons={<>
                <FilePicker id='project_task_files_uploaded_files' multiple={true}>Файлы</FilePicker>
                <Button id='project_task_files_load_button' onClick={() => {
                    sendFiles(taskId)
                }}>Загрузить</Button>
            </>} status={taskFileManagementSatus}>
                <ul className='project_task_files__list'>
                    {
                        taskFiles.map((file) => {
                            return (
                                <>
                                    <li className='project_task_files__list__file'>
                                        <div className="project_task_files__list__file__info">
                                            <h4>{file.file_name}</h4>
                                            <p>Дата: {file.upload_date}</p>
                                        </div>
                                        <div className="project_task_files__list__file__buttons">
                                            <a className='default_button light_button'
                                               href={`/api/projects/${id}/tasks/${file.task}/files/${file.id}/`}>Скачать</a>
                                            <Button className='red_button' onClick={() => {
                                                checkConfirmation(
                                                    'Уверены, что хотит удалить этот файл?',
                                                    () => {
                                                        axios(DELETE(`/api/projects/${id}/tasks/${file.task}/files/${file.id}/`)).then(
                                                            (response) => {
                                                                checkResponse(response, null, null, () => {
                                                                    getTaskFiles(file.task)
                                                                })
                                                            }
                                                        ).catch((error) => {
                                                            checkResponse(error.response)
                                                        })
                                                    }
                                                )
                                            }}>Удалить</Button>
                                        </div>
                                    </li>
                                </>
                            )
                        })
                    }
                </ul>
            </Modal>
        </>
    )
}