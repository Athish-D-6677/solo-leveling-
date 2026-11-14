package com.thesystem.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FirebasePrincipal {
    private final String uid;
    private final String email;
    private final boolean admin;
}
