package io.edanni.achabus.application.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Created by eduardo on 22/07/16.
 */
@Controller
public class NavigationController
{
    @RequestMapping("/")
    public String home()
    {
        return "home";
    }

    @RequestMapping("/admin")
    public String admin()
    {
        return "admin";
    }
}
