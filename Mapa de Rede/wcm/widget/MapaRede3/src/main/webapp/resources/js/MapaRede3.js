var MapaRede3 = SuperWidget.extend({
    init: function () {
        //code
        console.log("init");
        BuscaPermissoes();

        $("#selectObra").on("change", function () {
            $("#listUsuarios").find(".row").remove();
            BuscaUsuarios($(this).val());
        });

        $("#btnEmail").on("click", function () {
            CriaEmail();
        });
    }
});

function BuscaPermissoes() {
    DatasetFactory.getDataset("colleagueGroup", null, [
        DatasetFactory.createConstraint("colleagueId", WCMAPI.userCode, WCMAPI.userCode, ConstraintType.MUST),
        DatasetFactory.createConstraint("groupId", "Suporte TI", "Suporte TI", ConstraintType.MUST)
    ], null, {
        success: (grupo => {
            console.log(grupo);
            if (grupo.values.length > 0) {
                DatasetFactory.getDataset("MapaDeRedeObras", null, [
                    DatasetFactory.createConstraint("operacao", "SELECTALL", "SELECTALL", ConstraintType.MUST)
                ], null, {
                    success: (obras => {
                        var options = "";
                        obras.values.forEach(obra => {
                            options += "<option value='" + obra.NOME + "'>" + obra.CODIGO + " - " + obra.NOME + "</option>";
                        });
                        $("#selectObra").append(options);
                        $("#divSelectObra").show();

                    })
                })
            }
            else {
                $("#divSelectObra").hide();
                DatasetFactory.getDataset("colleagueGroup", null, [
                    DatasetFactory.createConstraint("colleagueId", WCMAPI.userCode, WCMAPI.userCode, ConstraintType.MUST),
                    DatasetFactory.createConstraint("groupId", "Obra%", "Obra%", ConstraintType.SHOULD, true),
                    DatasetFactory.createConstraint("groupId", "Regional%", "Regional%", ConstraintType.SHOULD, true),
                    DatasetFactory.createConstraint("groupId", "Britagem%", "Britagem%", ConstraintType.SHOULD, true),
                    DatasetFactory.createConstraint("groupId", "Central%", "Central%", ConstraintType.SHOULD, true),
                    DatasetFactory.createConstraint("groupId", "Matriz", "Matriz", ConstraintType.SHOULD)
                ], null, {
                    success: (async (obras) => {

                        for (var i = 0; i < obras.values.length; i++) {
                            await BuscaUsuarios(obras.values[i]["colleagueGroupPK.groupId"])
                        }

                    }),
                    error: (error => {
                        FLUIGC.toast({
                            title: "Erro ao buscar Obras:",
                            message: error,
                            type: "warning"
                        });
                    })
                })
            }
        })
    });
}

function BuscaUsuarios(obra) {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("MapaDeRedeUsuario", null, [
            DatasetFactory.createConstraint("operacao", "CONSULTAWHEREOBRA", "CONSULTAWHEREOBRA", ConstraintType.MUST),
            DatasetFactory.createConstraint("obra", obra, obra, ConstraintType.MUST)
        ], null, {
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao buscar Usuarios",
                    message: error,
                    type: "warning"
                });
                resolve();
            }),
            success: (async usuarios => {
                if (usuarios.values.length > 0) {
                    if (usuarios.values[0].coluna == "deu erro!") {
                        FLUIGC.toast({
                            title: "Erro ao buscar Usuarios",
                            message: usuarios[0][1],
                            type: "warning"
                        });
                    }
                    else {
                        for (var i = 0; i < usuarios.values.length; i++) {
                            console.log(usuarios.values[i]);
                            await InsereUsuario(usuarios.values[i]);
                        }
                    }
                }
                resolve();
            })
        });
    });
}

function InsereUsuario(usuario) {
    return new Promise((resolve, reject) => {
        var listURLImagensEquipamentos = [
            {
                TIPO: "Monitor",
                URL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQi3cOOAqqZCOvVwfOKxD3Ff0rrXsLxr2GlyiFzzLjPgy4TrK1C9SrPsQaQwf_W4b3aJvQ&usqp=CAU"
            },
            {
                TIPO: "Celular",
                URL: "http://fluig.castilho.com.br:1010/DashboardMapaDeRede/resources/images/CELULAR.png"
            },
            {
                TIPO: "Impressora",
                URL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTv8kad7n0XmVaiIHt3qphIi-BwR93CYUMhoHbC0XuCEAPsTAKj55aKPi-Pdg&usqp=CAc"
            },
            {
                TIPO: "Tablet",
                URL: "http://fluig.castilho.com.br:1010/DashboardMapaDeRede/resources/images/Apple-Tablet-PNG-Download-Image.png"
            },
            {
                TIPO: "Desktop",
                URL: "http://fluig.castilho.com.br:1010/DashboardMapaDeRede/resources/images/DESKTOP.png"
            },
            {
                TIPO: "Servidor",
                URL: "http://fluig.castilho.com.br:1010/DashboardMapaDeRede/resources/images/SERVIDOR.png"
            },
            {
                TIPO: "Notebook",
                URL: "http://fluig.castilho.com.br:1010/DashboardMapaDeRede/resources/images/NOTEBOOK.png"
            },
            {
                TIPO: "Chip",
                URL: "http://fluig.castilho.com.br:1010/DashboardMapaDeRede/resources/images/claro-logo-600x600-30290-e1495042098126.png"
            },
            {
                TIPO: "Nobreak",
                URL: ""
            },
            {
                TIPO: "Projetor",
                URL: ""
            },
            {
                TIPO: "Relógio Ponto",
                URL: ""
            }
        ];

        DatasetFactory.getDataset("MapaDeRedeEquipamento", null, [
            DatasetFactory.createConstraint("operacao", "CONSULTAWHEREUSUARIO", "CONSULTAWHEREUSUARIO", ConstraintType.MUST),
            DatasetFactory.createConstraint("codusuario", usuario.CODIGO, usuario.CODIGO, ConstraintType.MUST),
        ], null, {
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao buscar Equipamentos",
                    message: error,
                    type: "warning"
                });
                resolve();
            }),
            success: (equipamentos => {
                if (equipamentos.values.length > 0) {
                    if (equipamentos.values[0].coluna == "deu erro!") {
                        FLUIGC.toast({
                            title: "Erro ao buscar Equipamentos",
                            message: equipamentos[0][1],
                            type: "warning"
                        });

                    }
                    else {
                        console.log(equipamentos)
                        var html =
                            `<div class="row">
                            <div class="col-md-12">
                                <div class="card cardUsuario" style="border: 1px solid black;">
                                    <div class="card-body">
                                        <h2 class="card-title">` + usuario.NOME + `</h2>
                                        <div class="row">
                                            <div class="col-md-12">
                                                <div style='white-space: nowrap; margin-right: 20px; display: inline-flex;'>
                                                    <b>Usuario:</b><span class='spanUsuario'>` + usuario.CODIGO + `</span>                                                
                                                </div>
                                                <div style='white-space: nowrap; margin-right: 20px; display: inline-flex;'>
                                                    <b>Obra: </b><span class='spanObra'>` + usuario.OBRA + `</span>
                                                </div>
                                                <div style='white-space: nowrap; margin-right: 20px; display: inline-flex;'>
                                                    <b>Cargo: </b><span class='spanCargo'>` + usuario.CARGO + `</span>                                                
                                                </div>
                                                <div style='white-space: nowrap; margin-right: 20px; display: inline-flex;'>
                                                    <b>E-mail: </b><span class='spanEmail'>` + usuario.EMAIL + `</span>                                            
                                                </div>                                           
                                            </div>
                                            <div class='col-md-12'>
                                                <div style='white-space: nowrap; margin-right: 20px; display: inline-flex;'>
                                                    <b>Usuário Fluig: </b><span>` + (usuario.FLUIG == "true" ? "<i class='flaticon flaticon-done icon-sm'></i>" : "<i class='flaticon flaticon-close icon-sm' aria-hidden='true'></i>") + `</span>
                                                </div>
                                                <div style='white-space: nowrap; margin-right: 20px; display: inline-flex;'>
                                                    <b>Usuário RM: </b><span>` + (usuario.RM == "true" ? "<i class='flaticon flaticon-done icon-sm'></i>" : "<i class='flaticon flaticon-close icon-sm' aria-hidden='true'></i>") + `</span>    
                                                </div>
                                                <div style='white-space: nowrap; margin-right: 20px; display: inline-flex;'>
                                                    <b>Usuário SISMA: </b><span>` + (usuario.SISMA == "true" ? "<i class='flaticon flaticon-done icon-sm'></i>" : "<i class='flaticon flaticon-close icon-sm' aria-hidden='true'></i>") + `</span>
                                                </div>     
                                            </div>
                                        </div>
                                        <br>
                                        <div class="row display-flex">`;

                                    for (var i = 0; i < equipamentos.values.length; i++) {
                                        html +=
                                            `<div class="col-md-2 col-sm-3" style='margin-bottom:20px;'>
                                                <div class="card cardEquipamento" style="border: 1px solid black; height:100%;">
                                                    <img class="card-img-top" src="` + listURLImagensEquipamentos.find(e => e.TIPO == equipamentos.values[i].TIPO).URL + `" alt="Card image cap" style="height: 75px; width:auto; margin: auto;">
                                                    <div class="card-body" style="background-color: lightgrey;">
                                                        <h5 class="card-title">` + equipamentos.values[i].TIPO + `</h5>
                                                        <p class="card-text">`
                                                            + (equipamentos.values[i].TIPO == "Chip" ? equipamentos.values[i].DESCRICAO : equipamentos.values[i].PATRIMONIO)
                                                            + (equipamentos.values[i].TIPO == "Chip" ? "" : "<br>" + equipamentos.values[i].DESCRICAO) +
                                                        `</p>
                                                    </div>
                                                </div>
                                            </div>`;
                                    }

                                html +=
                                    `</div>
                                        <br>
                                        <div class="row">
                                            <div class="col-md-12">
                                                <label for="">Observação: </label>
                                                <textarea cols="30" rows="4" class="form-control inputObservacaoUsuario"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <br />
                            </div>
                        </div>`;

                        $("#listUsuarios").append(html);
                        resolve();
                    }
                }
                resolve();
            })
        });
    })
}

function CriaEmail() {
    var html = "Observações encaminhadas pelo mapa de rede pelo usuário " + BuscaNomeUsuarioLogado() + "<br><br>";


    var observacoes = "";

    $("#listUsuarios").find(".cardUsuario").each(function () {
        if ($(this).find(".inputObservacaoUsuario").val() != "") {
            observacoes += "<b>Usuário: </b>" + $(this).find(".spanUsuario").text() + "<br>";
            observacoes += "<b>Obra: </b>" + $(this).find(".spanObra").text() + "<br>";
            observacoes += "<b>Cargo: </b>" + $(this).find(".spanCargo").text() + "<br>";
            observacoes += "<b>E-mail: </b>" + $(this).find(".spanEmail").text() + "<br>";

            observacoes += "<b>Observação: </b><br>" + $(this).find(".inputObservacaoUsuario").val().split("\n").join("<br>");
            observacoes += "<br><br>";
        }
    });

    if ($("#textObservacoes").val() != null && $("#textObservacoes").val() != "") {
        observacoes += "<b>Observação: </b><br>" + $("#textObservacoes").val().split("\n").join("<br>");
        observacoes += "<br><br>";
    }
    console.log(observacoes)

    if (observacoes != "") {
        html += observacoes;
        var data = {
            "to": "informatica@castilho.com.br; " + BuscaEmailUsuario(WCMAPI.userCode),
            //"to": "gabriel.persike@castilho.com.br",
            from: "fluig@construtoracastilho.com.br", //Prod
            //from: "no-reply@construtoracastilho.com.br", //Homolog
            "subject": "Divergências Mapa de Rede", //   subject
            "templateId": "TPL_DIVERGENCIAS_MAPA_DE_REDE", // Email template Id previously registered
            "dialectId": "pt_BR", //Email dialect , if not informed receives pt_BR , email dialect ("pt_BR", "en_US", "es")
            "param": { "MENSAGEM": html } //  Map with variables to be replaced in the template
        };
    
        $.ajax({
            url: "/api/public/alert/customEmailSender",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data)
        })
            .done(function (data) {
                FLUIGC.message.alert({
                    message: 'E-mail encaminhado ao TI com as observações',
                    title: '',
                    label: 'OK'
                }, function (el, ev) {
                    parent.location.reload();
                });
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                FLUIGC.toast({
                    message: 'Erro ao enviar o e-mail.',
                    type: 'danger'
                });
                //Falha
            });
    }else{        FLUIGC.toast({
            message: "Nenhuma observação preenchida.",
            type: "warning"
        });
    }
}

function BuscaNomeUsuarioLogado(){
    return DatasetFactory.getDataset("colleague", ["colleagueName"], [
        DatasetFactory.createConstraint("colleagueId", WCMAPI.userCode, WCMAPI.userCode, ConstraintType.MUST)
    ], null).values[0].colleagueName;
}

function BuscaEmailUsuario(usuario) {
    var c1 = DatasetFactory.createConstraint("colleagueId", usuario, usuario, ConstraintType.MUST);
    var ds = DatasetFactory.getDataset("colleague", null, [c1], null);
    return ds.values[0]['mail'];
}
